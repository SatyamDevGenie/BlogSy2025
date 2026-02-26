/**
 * Groq API service for AI writing assistance.
 * Uses OpenAI-compatible chat completions endpoint.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const MAX_TOKENS = 2048;

/**
 * Call Groq chat completions API.
 * @param {Array<{ role: string, content: string }>} messages - Chat messages
 * @param {number} maxTokens - Max tokens to generate
 * @returns {Promise<string>} - Assistant reply text
 */
export async function callGroq(messages, maxTokens = MAX_TOKENS) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    let message = `Groq API error: ${response.status}`;
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.error?.message) message = parsed.error.message;
    } catch (_) {
      if (errBody) message = errBody.slice(0, 200);
    }
    throw new Error(message);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (content == null) {
    throw new Error("No content in Groq API response");
  }
  return content.trim();
}

/**
 * Writing assistant prompts per action.
 */
export const WRITING_PROMPTS = {
  expand: {
    system: `You are a helpful writing assistant for a blog. Your task is to EXPAND the user's text into a longer, more detailed paragraph. Keep the same tone and meaning. Do not add bullet points or headings unless the original has them. Output only the expanded text, nothing else.`,
    user: (text) => `Expand this into a fuller paragraph:\n\n${text}`,
  },
  shorten: {
    system: `You are a helpful writing assistant for a blog. Your task is to SHORTEN the user's text into a more concise version. Keep the main idea and tone. Output only the shortened text, nothing else.`,
    user: (text) => `Shorten this while keeping the main idea:\n\n${text}`,
  },
  improve: {
    system: `You are a helpful writing assistant for a blog. Your task is to IMPROVE the user's text: fix awkward phrasing, improve clarity and flow, and make it more engaging. Keep the same meaning and approximate length. Output only the improved text, nothing else.`,
    user: (text) => `Improve this paragraph for clarity and flow:\n\n${text}`,
  },
  "fix-grammar": {
    system: `You are a helpful writing assistant for a blog. Your task is to FIX grammar, spelling, and punctuation in the user's text. Preserve the original tone and structure. Output only the corrected text, nothing else.`,
    user: (text) => `Fix grammar and spelling in this text:\n\n${text}`,
  },
};
