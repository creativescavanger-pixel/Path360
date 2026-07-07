import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
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
        headers: corsHeaders,
      })
    }

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

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const token = authHeader.replace('Bearer ', '')

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: userError?.message || 'Unauthorized user.' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const userId = user.id
    const bucketName = 'founder-files'

    const { data: fileRows, error: fileRowsError } = await admin
      .from('founderfiles')
      .select('filepath')
      .eq('userid', userId)

    if (fileRowsError) {
      throw new Error(`Failed to load founder files: ${fileRowsError.message}`)
    }

    const paths = (fileRows ?? [])
      .map((row) => row?.filepath)
      .filter((value): value is string => Boolean(value))

    if (paths.length > 0) {
      const { error: storageDeleteError } = await admin.storage.from(bucketName).remove(paths)
      if (storageDeleteError) {
        throw new Error(`Failed to delete storage files: ${storageDeleteError.message}`)
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
      if (error) {
        throw new Error(`Failed deleting from ${table}: ${error.message}`)
      }
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      throw new Error(`Failed to delete auth user: ${deleteUserError.message}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unexpected error deleting account.',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})