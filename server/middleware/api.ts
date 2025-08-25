// server/middleware/api.ts
export default defineEventHandler((event) => {
  // Only run logic for /api/** routes
  if (event.node.req.url?.startsWith('/api/')) {
    // Your middleware logic here (e.g., logging, authentication, etc.)
    console.log(`[API Middleware] ${event.node.req.method} ${event.node.req.url}`)
    // To block the request, you could throw an error:
    // throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  // For all other routes, do nothing
})