// supabase/functions/delete-account/index.ts
// @ts-nocheck

import {
  createClient,
  SupabaseClient,
} from 'https://esm.sh/@supabase/supabase-js@2'

// Types for rows we read/delete
type FounderFilesRow = {
  filepath: string | null
}

type DeleteAccountPayload =
  | { success: true }
  | { error: string }

const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim() ?? ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')?.trim() ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? ''

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase server env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before deploying the edge function.',
  )
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      const body: DeleteAccountPayload = {
        error: 'Missing authorization header.',
      }
      return new Response(JSON.stringify(body), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const userClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
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

    const admin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token)

    if (userError || !user) {
      const body: DeleteAccountPayload = {
        error: userError?.message ?? 'Unauthorized user.',
      }
      return new Response(JSON.stringify(body), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const userId = user.id
    const bucketName = 'founder-files'

    // Load file paths for this founder
    const {
      data: fileRows,
      error: fileRowsError,
    } = await admin
      .from<FounderFilesRow>('founderfiles')
      .select('filepath')
      .eq('userid', userId)

    if (fileRowsError) {
      throw new Error(
        `Failed to load founder files: ${fileRowsError.message}`,
      )
    }

    const paths: string[] = (fileRows ?? [])
      .map((row) => row?.filepath ?? null)
      .filter((value): value is string => Boolean(value))

    if (paths.length > 0) {
      const { error: storageDeleteError } = await admin.storage
        .from(bucketName)
        .remove(paths)

      if (storageDeleteError) {
        throw new Error(
          `Failed to delete storage files: ${storageDeleteError.message}`,
        )
      }
    }

    // Tables with userid foreign key
    const tables: string[] = [
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
        throw new Error(
          `Failed deleting from ${table}: ${error.message}`,
        )
      }
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      throw new Error(
        `Failed to delete auth user: ${deleteUserError.message}`,
      )
    }

    const body: DeleteAccountPayload = { success: true }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unexpected error deleting account.'

    const body: DeleteAccountPayload = { error: message }

    return new Response(JSON.stringify(body), {
      status: 500,
      headers: corsHeaders,
    })
  }
})