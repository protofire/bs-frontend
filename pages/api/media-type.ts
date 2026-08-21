import type { NextApiRequest, NextApiResponse } from 'next';
import nodeFetch from 'node-fetch';

import { guardedAgent, parseSafeUrl } from 'nextjs/utils/externalRequest';
import { httpLogger } from 'nextjs/utils/logger';

import getQueryParamString from 'lib/router/getQueryParamString';

const REQUEST_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 3;

export default async function mediaTypeHandler(req: NextApiRequest, res: NextApiResponse) {
  httpLogger(req, res);

  // node-fetch@3 has no "timeout" option, so the request is aborted manually;
  // without it a slow external gateway (e.g. ipfs.io) keeps the socket open indefinitely
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    // throws for anything but a public http(s) destination
    const url = parseSafeUrl(getQueryParamString(req.query.url));
    const response = await nodeFetch(url.toString(), {
      method: 'HEAD',
      signal: abortController.signal,
      agent: guardedAgent,
      follow: MAX_REDIRECTS,
    });

    if (response.status !== 200) {
      throw new Error();
    }

    const contentType = response.headers.get('content-type');
    const mediaType = (() => {
      if (contentType?.startsWith('video')) {
        return 'video';
      }

      if (contentType?.startsWith('image')) {
        return 'image';
      }

      if (contentType?.startsWith('text/html')) {
        return 'html';
      }
    })();
    res.status(200).json({ type: mediaType });
  } catch (error) {
    res.status(200).json({ type: undefined });
  } finally {
    clearTimeout(timeoutId);
  }
}
