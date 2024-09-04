import { NextRequest, NextResponse } from 'next/server'
import cors from 'cors'

const corsMiddleware = cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
})

export async function POST(req: NextRequest) {
  // Run the CORS middleware
  await new Promise((resolve, reject) => {
    corsMiddleware(req as any, NextResponse.next() as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })

  const body = await req.json()
  console.log('Received request:', req.method, req.url)
  console.log('Request body:', body)

  // Your event recording logic here
  // For example:
  // await recordEvent(body)

  return NextResponse.json({ message: 'Event recorded successfully' })
}

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight request
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}