// import type { VercelRequest, VercelResponse } from '@vercel/node';
// import fetch from 'node-fetch';

// type CheckResult = {
//   url: string;
//   status: number | null;
//   ok: boolean;
//   error?: string;
// };

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed. Use POST.' });
//   }

//   const urls: string[] = req.body?.urls;

//   if (!Array.isArray(urls)) {
//     return res.status(400).json({ message: 'Invalid request body. Expected "urls" to be an array of strings.' });
//   }

//   const results: CheckResult[] = await Promise.all(
//     urls.map(async (url) => {
//       try {
//         const response = await fetch(url, { method: 'GET', timeout: 5000 });
//         return {
//           url,
//           status: response.status,
//           ok: response.ok,
//         };
//       } catch (error: any) {
//         return {
//           url,
//           status: null,
//           ok: false,
//           error: error.message,
//         };
//       }
//     })
//   );

//   const broken = results.filter(r => !r.ok);
//   res.status(200).json({ broken });
// }

import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch, { RequestInit } from 'node-fetch';

type CheckResult = {
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST.' });
  }

  const urls: string[] = req.body?.urls;

  if (!Array.isArray(urls)) {
    return res.status(400).json({ message: 'Invalid request body. Expected "urls" to be an array of strings.' });
  }

  const results: CheckResult[] = await Promise.all(
    urls.map(async (url) => {
      try {
        const options: RequestInit = {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          },
          // Note: node-fetch v2 does NOT support timeout in options. Use AbortController for timeout.
        };

        // Implement timeout with AbortController
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);

        const contentType = response.headers.get('content-type');

        if (response.status === 403 && contentType?.includes('text/html')) {
          return {
            url,
            status: response.status,
            ok: false,
            error: '403 Forbidden – likely CDN or bot-blocking',
          };
        }

        return {
          url,
          status: response.status,
          ok: response.ok,
        };
      } catch (error: any) {
        // Catch fetch abort and other errors
        const message =
          error.name === 'AbortError'
            ? 'Request timed out after 5 seconds'
            : error.message || 'Unexpected error occurred';

        return {
          url,
          status: null,
          ok: false,
          error: message,
        };
      }
    })
  );

  // Filter only broken URLs (ok: false)
  const broken = results.filter((r) => !r.ok);

  res.status(200).json({ broken });
}
