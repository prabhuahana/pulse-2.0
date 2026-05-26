import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionExitCode } from "@/lib/panic-mode/exit-code-service";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId } = (await req.json()) as {
      sessionId?: string;
      userId?: string;
    };

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "sessionId and userId are required" },
        { status: 400 }
      );
    }

    const { expiresAt } = await getOrCreateSessionExitCode(sessionId, userId);

    return NextResponse.json({
      sessionId,
      expiresAt,
      activatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("panic activate:", e);
    return NextResponse.json(
      { error: "Failed to activate panic session" },
      { status: 500 }
    );
  }
}
