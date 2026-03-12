import { getSessionId } from "@/utils/session";

export const API_BASE_URL = import.meta.env.VITE_APP_NGROK || "http://localhost:5050";

export type PlatformType = "tiktok" | "instagram" | "generic";
export type StoryboardStatus = "draft" | "needs_input" | "ready" | "approved";

export type StoryboardScene = {
  scene_number: number;
  title: string;
  visual_idea: string;
  objective: string;
  narration: string;
  on_screen_text: string;
  duration_seconds: number;
};

export type Storyboard = {
  title: string;
  concept: string;
  platform: PlatformType;
  tone: string;
  target_audience?: string | null;
  key_message?: string | null;
  assumptions: string[];
  scenes: StoryboardScene[];
  status: StoryboardStatus;
};

export type CreativeBrief = {
  product?: string | null;
  audience?: string | null;
  platform: PlatformType;
  tone?: string | null;
  goal?: string | null;
  key_message?: string | null;
  assets_available: string[];
  assumptions: string[];
  missing_fields: string[];
  source_summary?: string | null;
};

export type StoryboardCritique = {
  score: number;
  issues: string[];
  recommended_action: "approve" | "revise" | "ask_user";
};

export type StoryboardChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type StoryboardChatResponse = {
  assistant_message: string;
  storyboard?: Storyboard | null;
  brief?: CreativeBrief | null;
  critique?: StoryboardCritique | null;
  clarifying_questions: string[];
  image_prompt?: string | null;
  image_result?: Record<string, unknown> | null;
  messages: StoryboardChatMessage[];
};

function makeHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(),
    "ngrok-skip-browser-warning": "1",
  };
}

async function readError(response: Response) {
  try {
    const data = await response.json();
    return data?.detail || data?.message || `Request failed with ${response.status}`;
  } catch {
    const text = await response.text();
    return text || `Request failed with ${response.status}`;
  }
}


export async function chatStoryboard(payload: {
  message: string;
  storyboard?: Storyboard | null;
  messages?: StoryboardChatMessage[];
  project_id?: string;
  request_image?: boolean;
  brand_context?: string;
  product_context?: string;
}): Promise<StoryboardChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storyboards/chat`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function getStoryboardMessages(): Promise<StoryboardChatMessage[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storyboards/messages`, {
    headers: makeHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export async function clearStoryboardMessages(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/storyboards/messages`, {
    method: "DELETE",
    headers: makeHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }
}
