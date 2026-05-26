import OpenAI from "openai";
import { z } from "zod";
import type { TaskVerificationResult } from "@/types/panic-session";

const verificationSchema = z.object({
  verified: z.boolean(),
  uncertain: z.boolean(),
  failed: z.boolean(),
  confidence: z.number().min(0).max(1),
  message: z.string(),
});

export function isAiVerificationConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function verifyTaskImage(params: {
  imageBase64: string;
  mimeType: string;
  taskTitle: string;
  visionPrompt: string;
}): Promise<TaskVerificationResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to apps/web/.env.local"
    );
  }

  const openai = new OpenAI({ apiKey });
  const dataUrl = `data:${params.mimeType};base64,${params.imageBase64}`;

  const system = `You are a supportive safety assistant for a mental health app called Pulse.
Evaluate whether the user's photo satisfies the panic-mode recovery task.
Respond ONLY with valid JSON matching this schema:
{"verified":boolean,"uncertain":boolean,"failed":boolean,"confidence":number,"message":string}
Rules:
- verified=true only when the task is clearly completed
- uncertain=true when image is blurry, partial, or ambiguous (ask for retry)
- failed=true when image clearly does not match
- confidence is 0.0 to 1.0
- message is one short helpful sentence for the user`;

  const userText = `Task: ${params.taskTitle}
Verification criteria: ${params.visionPrompt}`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 300,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("AI returned an empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const result = verificationSchema.parse(parsed);
  return {
    verified: result.verified && !result.failed && !result.uncertain,
    uncertain: result.uncertain,
    failed: result.failed || (!result.verified && !result.uncertain),
    confidence: result.confidence,
    message: result.message,
  };
}
