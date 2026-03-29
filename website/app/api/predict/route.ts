import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.text || typeof body.text !== 'string') {
    return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
  }

  try {
    const res = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body.text }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: data.detail || 'Backend prediction failed.' },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const isConnectionRefused = err instanceof TypeError || (err as any)?.cause?.code === 'ECONNREFUSED'
    if (isConnectionRefused) {
      return NextResponse.json(
        { error: 'Backend not running. Start it with: uvicorn backend.server:app --port 8000' },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'Failed to connect to prediction backend.' },
      { status: 502 },
    )
  }
}
