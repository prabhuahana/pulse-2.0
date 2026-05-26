import { NextRequest, NextResponse } from "next/server";
import {
  ExitCodeError,
  sendExitCodeToContact,
} from "@/lib/panic-mode/exit-code-service";
import { listUnlockRequestsForSession } from "@/lib/panic-mode/server-store";

interface UnlockRequestBody {
  sessionId: string;
  safetyContactId: string;
  userId: string;
  contact: {
    name: string;
    email?: string;
    phone?: string;
  };
  userName?: string;
}

/** @deprecated Prefer POST /api/panic/send-exit-code */
export async function POST(req: NextRequest) {
  try {
    const body: UnlockRequestBody = await req.json();
    const { sessionId, safetyContactId, userId, contact, userName } = body;

    if (!sessionId || !safetyContactId || !userId || !contact?.name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendExitCodeToContact({
      sessionId,
      safetyContactId,
      userId,
      contactName: contact.name,
      contactEmail: contact.email ?? "",
      userName: userName || "Pulse user",
    });

    return NextResponse.json({
      id: result.id,
      sessionId,
      safetyContactId,
      requestedAt: result.sentAt,
      lastSentAt: result.lastSentAt,
      contactName: result.contactName,
      sentVia: ["email"],
      message: `Unlock code emailed to ${contact.name}.`,
      emailMessageId: result.emailMessageId,
    });
  } catch (e) {
    if (e instanceof ExitCodeError) {
      return NextResponse.json(
        { error: e.message, code: e.code },
        { status: e.status }
      );
    }
    console.error("Error creating unlock request:", e);
    return NextResponse.json(
      { error: "Failed to create unlock request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const userId = req.nextUrl.searchParams.get("userId");

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing sessionId or userId" },
        { status: 400 }
      );
    }

    const list = await listUnlockRequestsForSession(sessionId, userId);
    const requests = list.map(
      (r) => ({
        id: r.id,
        sessionId: r.sessionId,
        safetyContactId: r.safetyContactId,
        requestedAt: r.requestedAt,
        lastSentAt: r.lastSentAt,
        approved: r.approved,
        approvedAt: r.approvedAt,
        expiresAt: r.expiresAt,
        contactName: r.contactName,
        sentVia: r.sentVia,
      })
    );

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching unlock requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch unlock requests" },
      { status: 500 }
    );
  }
}
