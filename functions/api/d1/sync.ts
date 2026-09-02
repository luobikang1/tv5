// Cloudflare Worker Function for D1 Database Synchronization and User Auth
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

  if (!env.DB) {
    return new Response(
      JSON.stringify({ success: false, message: 'Cloudflare D1 database binding (DB) not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Ensure tables exist
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS user_data (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER
      )`
    ).run();

    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at INTEGER
      )`
    ).run();

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (request.method === 'POST') {
      const body = await request.json();

      // Register endpoint
      if (action === 'register') {
        const { username, password } = body;
        if (!username || !password) {
          return new Response(JSON.stringify({ success: false, message: '用户名与密码不能为空' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const existing = await env.DB.prepare('SELECT username FROM users WHERE username = ?').bind(username).first();
        if (existing) {
          return new Response(JSON.stringify({ success: false, message: '该用户名已被注册' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await env.DB.prepare('INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)')
          .bind(username, password, Date.now())
          .run();

        return new Response(JSON.stringify({ success: true, message: '注册成功' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // User Login endpoint
      if (action === 'login') {
        const { username, password } = body;
        const user = await env.DB.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
          .bind(username, password)
          .first();

        if (user) {
          return new Response(JSON.stringify({ success: true, username: user.username }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Default Key-Value store
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

    if (request.method === 'GET') {
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
