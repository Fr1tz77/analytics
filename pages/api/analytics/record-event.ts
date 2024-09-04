import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
})

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
  await runMiddleware(req, res, cors)

  console.log('Received request:', req.method, req.url)
  console.log('Request body:', req.body)

  // Your event recording logic here
  // For example:
  // await recordEvent(req.body)

  res.status(200).json({ message: 'Event recorded successfully' })
}