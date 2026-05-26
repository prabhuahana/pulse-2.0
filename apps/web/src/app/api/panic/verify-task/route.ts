import { NextRequest, NextResponse } from "next/server";
import { verifyTaskImage, isAiVerificationConfigured } from "@/lib/aiVerification";
import {
  bufferToBase64,
  deleteTemporaryUpload,
  saveTemporaryUpload,
} from "@/lib/panic-mode/image-upload";
import { checkVerifyRateLimit } from "@/lib/panic-mode/verify-rate-limit";

export async function POST(req: NextRequest) {
  let uploadPath: string | null = null;

  try {
    if (!isAiVerificationConfigured()) {
      return NextResponse.json(
        {
          error: "AI verification is not configured. Set OPENAI_API_KEY.",
          code: "AI_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const file = form.get("image");
    const sessionId = form.get("sessionId")?.toString();
    const taskId = form.get("taskId")?.toString();
    const taskTitle = form.get("taskTitle")?.toString();
    const visionPrompt = form.get("visionPrompt")?.toString();

    if (!sessionId || !taskId || !taskTitle || !visionPrompt) {
      return NextResponse.json(
        { error: "Missing required fields", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required", code: "MISSING_IMAGE" },
        { status: 400 }
      );
    }

    const rate = checkVerifyRateLimit(sessionId);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many verification attempts. Retry in ${Math.ceil((rate.retryAfterMs ?? 0) / 1000)}s.`,
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    const mimeType = file.type || "image/jpeg";
    const buffer = Buffer.from(await file.arrayBuffer());
    uploadPath = await saveTemporaryUpload(buffer, mimeType);

    const result = await verifyTaskImage({
      imageBase64: bufferToBase64(buffer),
      mimeType,
      taskTitle,
      visionPrompt,
    });

    return NextResponse.json({
      taskId,
      verified: result.verified,
      uncertain: result.uncertain,
      failed: result.failed,
      confidence: result.confidence,
      message: result.message,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json(
      { error: message, code: "VERIFICATION_ERROR" },
      { status: 500 }
    );
  } finally {
    if (uploadPath) {
      await deleteTemporaryUpload(uploadPath);
    }
  }
}
