/*
  Gate the employee area. Anything under /team (except the sign-in page) needs a
  Microsoft 365 session; the authorized() callback in src/auth.ts decides, and
  unauthenticated visitors are sent to /team/sign-in.
*/
export { auth as proxy } from "@/auth";

export const config = { matcher: ["/team/:path*"] };
