// Basic Auth middleware for Cloudflare Pages
// Username: mubell | Password: mubell2026

export async function onRequest(context) {
  const CREDENTIALS = {
    username: 'mubell',
    password: 'mubell2026',
  };

  const authorization = context.request.headers.get('Authorization');

  if (authorization) {
    const [scheme, encoded] = authorization.split(' ');

    if (scheme === 'Basic') {
      const decoded = atob(encoded);
      const [username, password] = decoded.split(':');

      if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        return await context.next();
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="MuBell Farm", charset="UTF-8"',
    },
  });
}
