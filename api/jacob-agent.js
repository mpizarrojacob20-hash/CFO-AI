import Anthropic from "@anthropic-ai/sdk";
import { JACOB_SYSTEM_PROMPT } from "../prompts/jacob-system-prompt.js";

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages must be a non-empty array" });
    return;
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: JACOB_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    res.status(200).json({
      reply: textBlock?.text ?? "",
      usage: response.usage,
    });
  } catch (error) {
    console.error("jacob-agent error:", error);
    res.status(500).json({ error: "Failed to get a response from Jacob." });
  }
}
