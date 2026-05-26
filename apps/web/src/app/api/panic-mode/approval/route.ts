import { NextRequest, NextResponse } from "next/server";

interface ApprovalBody {
  unlockRequestId: string;
  approvalToken: string;
  safetyContactId: string;
  approved: boolean;
}

// In a real app, this would use a database
const approvals = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const body: ApprovalBody = await req.json();
    const { unlockRequestId, approvalToken, safetyContactId, approved } = body;

    if (!unlockRequestId || !approvalToken || safetyContactId === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const approval = {
      id: Date.now().toString(),
      unlockRequestId,
      safetyContactId,
      approved,
      approvedAt: new Date().toISOString(),
      approvalToken: "***", // Don't return the actual token
    };

    approvals.set(approval.id, approval);

    // TODO: Log activity
    // await logPanicModeActivity({
    //   type: 'UNLOCK_APPROVED',
    //   unlockRequestId,
    //   safetyContactId,
    // });

    return NextResponse.json(approval);
  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const unlockRequestId = req.nextUrl.searchParams.get("unlockRequestId");

    if (!unlockRequestId) {
      return NextResponse.json(
        { error: "Missing unlockRequestId" },
        { status: 400 }
      );
    }

    const approval = Array.from(approvals.values()).find(
      a => a.unlockRequestId === unlockRequestId
    );

    if (!approval) {
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error("Error fetching approval:", error);
    return NextResponse.json(
      { error: "Failed to fetch approval" },
      { status: 500 }
    );
  }
}
