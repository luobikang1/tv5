// Cloudflare Worker Function for D1 Database Synchronization
export async function onRequest(context: any) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if D1 database binding exists
  if (!env.DB) {
    return new Response(
      JSON.stringify({ success: false, message: 'Cloudflare D1 database binding (DB) not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Ensure table exists
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS user_data (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER
      )`
    ).run();

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const key = url.searchParams.get('key');

      if (!key) {
        const { results } = await env.DB.prepare('SELECT * FROM user_data').all();
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const row = await env.DB.prepare('SELECT value FROM user_data WHERE key = ?').bind(key).first();
      return new Response(JSON.stringify({ success: true, value: row ? row.value : null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const { key, value } = body;

      if (!key) {
        return new Response(JSON.stringify({ success: false, message: 'Key is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await env.DB.prepare(
        `INSERT INTO user_data (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      ).bind(key, typeof value === 'string' ? value : JSON.stringify(value), Date.now()).run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
