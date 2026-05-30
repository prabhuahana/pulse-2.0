import { NextRequest, NextResponse } from "next/server";
import {
  ExitCodeError,
  sendExitCodeToContact,
} from "@/lib/panic-mode/exit-code-service";

interface SendExitCodeBody {
  sessionId: string;
  safetyContactId: string;
  userId: string;
  contactName: string;
  contactEmail: string;
  userName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendExitCodeBody;
    const {
      sessionId,
      safetyContactId,
      userId,
      contactName,
      contactEmail,
      userName,
    } = body;

    if (!sessionId || !safetyContactId || !userId || !contactName) {
      return NextResponse.json(
        { error: "Missing required fields", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const result = await sendExitCodeToContact({
      sessionId,
      safetyContactId,
      userId,
      contactName,
      contactEmail,
      userName: userName || "Stilo user",
    });

    return NextResponse.json({
      status: "sent",
      unlockRequestId: result.id,
      sentAt: result.sentAt,
      lastSentAt: result.lastSentAt,
      contactName: result.contactName,
      emailMessageId: result.emailMessageId,
      reusedCode: result.reusedCode,
    });
  } catch (e) {
    if (e instanceof ExitCodeError) {
      return NextResponse.json(
        { error: e.message, code: e.code },
        { status: e.status }
      );
    }
    console.error("send-exit-code error:", e);
    return NextResponse.json(
      { error: "Failed to send exit code", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
