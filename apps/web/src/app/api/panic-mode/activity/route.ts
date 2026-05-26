import { NextRequest, NextResponse } from "next/server";

export interface ActivityLogEntry {
  id: string;
  userId: string;
  type: "PANIC_START" | "PANIC_END" | "UNLOCK_REQUESTED" | "UNLOCK_APPROVED" | "UNLOCK_DENIED";
  sessionId?: string;
  unlockRequestId?: string;
  safetyContactId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// In a real app, this would use a database
const activityLogs = new Map<string, ActivityLogEntry>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      type,
      sessionId,
      unlockRequestId,
      safetyContactId,
      metadata,
    } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry: ActivityLogEntry = {
      id: Date.now().toString(),
      userId,
      type,
      sessionId,
      unlockRequestId,
      safetyContactId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    activityLogs.set(entry.id, entry);

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
    const type = req.nextUrl.searchParams.get("type");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    let logs = Array.from(activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (type) {
      logs = logs.filter(log => log.type === type);
    }

    return NextResponse.json(logs.slice(0, limit));
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
