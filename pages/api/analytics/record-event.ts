import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

// Initialize the cors middleware
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
})

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await runMiddleware(req, res, cors)

  console.log('Received request:', req.method, req.url);
  console.log('Request body:', req.body);

  // Your existing API logic here
  // ...

  res.status(200).json({ message: 'Event recorded successfully' });
}