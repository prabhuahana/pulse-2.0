import { NextRequest, NextResponse } from "next/server";
import {
  approveUnlockRequest,
  getUnlockRequest,
} from "@/lib/panic-mode/file-store";

interface VerifyBody {
  unlockRequestId: string;
  code: string;
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyBody = await req.json();
    const { unlockRequestId, code, userId } = body;

    if (!unlockRequestId || !code || !userId) {
      return NextResponse.json(
        { error: "Missing required fields", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const request = await getUnlockRequest(unlockRequestId);

    if (!request) {
      return NextResponse.json(
        { error: "Unlock request not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (request.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized", code: "FORBIDDEN" }, { status: 403 });
    }

    if (request.approved) {
      return NextResponse.json({ approved: true, alreadyApproved: true });
    }

    if (new Date(request.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          error: "Unlock code has expired. Request a new code.",
          code: "EXPIRED",
        },
        { status: 410 }
      );
    }

    if (request.unlockCode !== code.trim()) {
      return NextResponse.json(
        { error: "Invalid unlock code", code: "INVALID_CODE" },
        { status: 401 }
      );
    }

    const approved = await approveUnlockRequest(unlockRequestId);

    return NextResponse.json({
      approved: true,
      approvedAt: approved?.approvedAt,
      contactName: request.contactName,
    });
  } catch (error) {
    console.error("Error verifying unlock code:", error);
    return NextResponse.json(
      { error: "Failed to verify unlock code", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
