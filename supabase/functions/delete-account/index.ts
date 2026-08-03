import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim() ?? ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')?.trim() ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? ''

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase server env vars. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY before deploying the edge function.'
  )
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Admin client with service role key (for deletes)
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // User client with anon key + JWT (to resolve current user)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id
    const bucketName = 'founder_profiles' // aligned with your actual Storage bucket

    const { data: fileRows, error: fileRowsError } = await admin
      .from('founderfiles')
      .select('filepath')
      .eq('userid', userId)

    if (fileRowsError) {
      throw fileRowsError
    }

    const paths = (fileRows ?? [])
      .map((row) => row?.filepath)
      .filter((value): value is string => Boolean(value))

    if (paths.length > 0) {
      const { error: storageDeleteError } = await admin.storage.from(bucketName).remove(paths)
      if (storageDeleteError) {
        throw storageDeleteError
      }
    }

    const tables = [
      'founderprogress',
      'documentintakes',
      'aiconversations',
      'generateddocuments',
      'foundermemory',
      'assessments',
      'founderfiles',
      'founderprofiles',
    ]

    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq('userid', userId)
      if (error) throw error
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId, false)
    if (deleteUserError) {
      throw deleteUserError
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unexpected error deleting account.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})