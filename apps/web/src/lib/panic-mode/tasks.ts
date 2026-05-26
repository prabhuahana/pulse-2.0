import type { PanicTask } from "@/types/panic-session";

function task(
  partial: Omit<PanicTask, "status" | "attempts" | "interactionElapsedSec">
): PanicTask {
  return {
    status: "pending",
    attempts: 0,
    interactionElapsedSec: 0,
    ...partial,
  };
}

export function createDefaultPanicTasks(): PanicTask[] {
  return [
    task({
      id: "drink-water",
      type: "image",
      title: "Drink water",
      description: "Take a photo showing you with a glass or bottle of water.",
      visionPrompt:
        "The user must show a clear photo of themselves or their hand holding a glass, cup, or bottle of water. Verify they appear to have access to drinking water. Reject empty rooms or unrelated images.",
    }),
    task({
      id: "go-outside",
      type: "image",
      title: "Step outside",
      description: "Capture proof you are outdoors or at a window with outdoor view.",
      visionPrompt:
        "Verify the image shows an outdoor environment, sky, plants, street, or a clear window view to outside. Indoor-only photos without outdoor elements should fail.",
    }),
    task({
      id: "breathing",
      type: "interaction",
      title: "Breathing exercise",
      description: "Follow the guided breathing cycle for at least 60 seconds.",
      minDurationSec: 60,
      interactionKind: "breathing",
    }),
    task({
      id: "grounding",
      type: "interaction",
      title: "Grounding exercise",
      description: "Complete the 5-4-3-2-1 grounding prompts mindfully.",
      minDurationSec: 90,
      interactionKind: "grounding",
    }),
    task({
      id: "journal",
      type: "interaction",
      title: "Calming journal",
      description: "Write a short reflection for at least 45 seconds.",
      minDurationSec: 45,
      interactionKind: "journal",
    }),
    task({
      id: "wake-challenge",
      type: "wake",
      title: "Wake confirmation",
      description: "Complete a cognitive challenge to confirm you are alert.",
      wakeKind: "math",
    }),
  ];
}

export function allTasksVerified(tasks: PanicTask[]): boolean {
  return tasks.length > 0 && tasks.every((t) => t.status === "verified");
}

export function timerElapsed(scheduledEndAt: string | null): boolean {
  if (!scheduledEndAt) return false;
  return Date.now() >= new Date(scheduledEndAt).getTime();
}

export function remainingSeconds(scheduledEndAt: string | null): number {
  if (!scheduledEndAt) return 0;
  return Math.max(
    0,
    Math.floor((new Date(scheduledEndAt).getTime() - Date.now()) / 1000)
  );
}
