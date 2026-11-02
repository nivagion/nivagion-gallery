const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000",
};

export function secureRequest(request: Request) {
  const url = new URL(request.url);
  if ((url.hostname === "www.nivagion.com" || url.hostname === "nivagion.com") &&
      (url.protocol !== "https:" || url.hostname !== "nivagion.com")) {
    const destination = new URL(`${url.pathname}${url.search}`, "https://nivagion.com");
    return { redirect: withSecurityHeaders(Response.redirect(destination, 308)) };
  }

  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' https://media.nivagion.com blob: data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("Content-Security-Policy", csp);
  headers.set("x-nonce", nonce);
  return { request: new Request(request, { headers }), csp };
}

export function secureResponse(response: Response, csp?: string) {
  const headers = new Headers(response.headers);
  if (csp) headers.set("Content-Security-Policy", csp);
  for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function withSecurityHeaders(response: Response) {
  return secureResponse(response);
}
