export async function onRequest(context: any) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-File-Name, X-File-Category',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const r2Bucket = env.R2_BUCKET || env.BUCKET || env.WHITEFOX_R2;

  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const category = (formData.get('category') as string) || '其他';

      if (!file) {
        return new Response(JSON.stringify({ success: false, message: 'No file uploaded' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fileKey = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      if (r2Bucket) {
        const arrayBuffer = await file.arrayBuffer();
        await r2Bucket.put(fileKey, arrayBuffer, {
          httpMetadata: {
            contentType: file.type || 'application/octet-stream',
          },
          customMetadata: {
            originalName: encodeURIComponent(file.name),
            category: encodeURIComponent(category),
            uploadDate: new Date().toLocaleString(),
          },
        });
      }

      const fileUrl = `/api/r2/storage?key=${encodeURIComponent(fileKey)}`;

      return new Response(
        JSON.stringify({
          success: true,
          file: {
            id: fileKey,
            name: file.name,
            sizeBytes: file.size,
            category,
            uploadDate: new Date().toLocaleString(),
            url: fileUrl,
            fileType: file.type || 'application/octet-stream',
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify({ success: false, message: 'Key param required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (r2Bucket) {
      try {
        const object = await r2Bucket.get(key);
        if (object) {
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Cache-Control', 'public, max-age=86400');
          return new Response(object.body, { headers });
        }
      } catch (r2Err) {
        console.warn('R2 get file error:', r2Err);
      }
    }

    return new Response(JSON.stringify({ success: false, message: 'File not found in R2' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (key && r2Bucket) {
      try {
        await r2Bucket.delete(key);
      } catch (err) {
        console.warn('R2 delete error:', err);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'File deleted' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: corsHeaders,
  });
}
