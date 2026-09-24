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

  // Robust Cloudflare D1 Binding Lookup
  const db = env.DB || env.DB_BINDING || env.WHITEFOX_DB;

  if (!db) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Cloudflare D1 数据库未绑定。请在 Cloudflare Pages 设置中的 Functions -> D1 Database Bindings 绑定名称为 DB 的数据库。',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Ensure D1 database tables are created automatically
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS user_data (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER
      )`
    ).run();

    await db.prepare(
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

        const existing = await db.prepare('SELECT username FROM users WHERE username = ?').bind(username).first();
        if (existing) {
          return new Response(JSON.stringify({ success: false, message: '该用户名已被注册' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await db.prepare('INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)')
          .bind(username, password, Date.now())
          .run();

        return new Response(JSON.stringify({ success: true, message: '注册成功' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // User Login endpoint
      if (action === 'login') {
        const { username, password } = body;
        const user = await db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
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

      // Delete user endpoint (admin action)
      if (action === 'delete_user') {
        const { username } = body;
        if (username) {
          await db.prepare('DELETE FROM users WHERE username = ?').bind(username).run();
          return new Response(JSON.stringify({ success: true, message: '用户已成功注销删除' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Sync Key-Value store
      const { key, value } = body;
      if (!key) {
        return new Response(JSON.stringify({ success: false, message: 'Key is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const valString = typeof value === 'string' ? value : JSON.stringify(value);

      await db.prepare(
        `INSERT INTO user_data (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      ).bind(key, valString, Date.now()).run();

      return new Response(JSON.stringify({ success: true, message: '数据已成功同步存入 Cloudflare D1 数据库' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET') {
      if (action === 'get_users') {
        const { results } = await db.prepare('SELECT username, created_at FROM users').all();
        return new Response(JSON.stringify({ success: true, users: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const key = url.searchParams.get('key');

      if (!key) {
        const { results } = await db.prepare('SELECT * FROM user_data').all();
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const row = await db.prepare('SELECT value FROM user_data WHERE key = ?').bind(key).first();
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
