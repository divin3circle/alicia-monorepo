import { NextResponse } from "next/server"

type VerifyRequest = {
  couponCode?: string
}

export const runtime = "nodejs"

function normalizeCode(value: string) {
  return value.trim().toUpperCase()
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()

  try {
    const body = (await req.json()) as VerifyRequest
    const input = normalizeCode(body.couponCode ?? "")
    const expected = normalizeCode(process.env.REVIEW_ACCESS_CODE ?? "")

    const freeTrial = Boolean(input && expected && input === expected)

    return NextResponse.json({
      freeTrial,
      requestId,
    })
  } catch (error) {
    console.error("[api/access-code/verify] request failed", {
      requestId,
      error,
    })

    return NextResponse.json(
      {
        freeTrial: false,
        error: "Failed to verify access code",
        requestId,
      },
      { status: 500 }
    )
  }
}
