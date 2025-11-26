import type { Report } from "../types/report.types";

const API_PREFIX = import.meta.env.VITE_API_URL || "/api";

export type ChatMessage = {
  id: number;
  sender: string;
  content: string;
  timestamp?: string;
  createdAt?: string;
  senderId?: number;
};

export type ChatConversation = {
  report: Report;
  messages: ChatMessage[];
};

export async function getReportMessages(
  reportId: number
): Promise<ChatMessage[]> {
  const res = await fetch(`${API_PREFIX}/reports/${reportId}/messages`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    let errorMessage = `HTTP error ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If parsing JSON fails, use the status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return data;
}

export async function sendReportMessage(
  reportId: number,
  content: string
): Promise<ChatMessage> {
  const res = await fetch(`${API_PREFIX}/reports/${reportId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    let errorMessage = `HTTP error ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If parsing JSON fails, use the status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return data.data;
}
