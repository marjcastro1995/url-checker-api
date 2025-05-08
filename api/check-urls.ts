// // File: api/check-urls.ts
// import type { VercelRequest, VercelResponse } from '@vercel/node';
// import fetch from 'node-fetch'; // Add to your package.json if using TypeScript locally

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
//     return res.status(400).json({ message: 'Invalid request body. Expected an array of URLs.' });
//   }

//   const results: CheckResult[] = await Promise.all(
//     urls.map(async (url) => {
//       try {
//         const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
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

//   res.status(200).json({ results });
// }

// File: api/check-urls.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

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
    return res.status(400).json({ message: 'Invalid request body. Expected an array of URLs.' });
  }

  const results: CheckResult[] = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
        return {
          url,
          status: response.status,
          ok: response.ok,
        };
      } catch (error: any) {
        return {
          url,
          status: null,
          ok: false,
          error: error.message,
        };
      }
    })
  );

  // Only return broken URLs
  const broken = results.filter(result => !result.ok);

  res.status(200).json({ broken });
}
