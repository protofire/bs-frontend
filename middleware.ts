import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import generateCspPolicy from 'nextjs/csp/generateCspPolicy';
import * as middlewares from 'nextjs/middlewares/index';

const cspPolicy = generateCspPolicy();

export function middleware(req: NextRequest) {
  const isPageRequest = req.headers.get('accept')?.includes('text/html');
  const start = Date.now();

  if (!isPageRequest) {
    return;
  }

  const accountResponse = middlewares.account(req);
  if (accountResponse) {
    return accountResponse;
  }

  const pathname = req.nextUrl.pathname;
  const accept = req.headers.get('accept') || '';

  // If browser tries to access a data route as HTML, redirect.
  // This fixes the caching of pageProps which is not correct, only HTML for a
  // given page should be cached.
  if (pathname.startsWith('/_next/') && accept.includes('text/html')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const end = Date.now();
  const res = NextResponse.next();
  res.headers.append('Content-Security-Policy', cspPolicy);
  res.headers.append('Server-Timing', `middleware;dur=${ end - start }`);
  res.headers.append('Docker-ID', process.env.HOSTNAME || '');

  return res;
}

/**
 * Configure which routes should pass through the Middleware.
 */
export const config = {
  matcher: [ '/', '/:notunderscore((?!_next).+)' ],
  // matcher: [
  //   '/((?!.*\\.|api\\/|node-api\\/).*)', // exclude all static + api + node-api routes
  // ],
};
