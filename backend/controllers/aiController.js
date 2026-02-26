import { callGroq, WRITING_PROMPTS } from "../utils/groqService.js";

const ALLOWED_ACTIONS = Object.keys(WRITING_PROMPTS);
const MAX_INPUT_LENGTH = 15000; // characters

/**
 * POST /api/ai/writing-assist
 * Body: { action: 'expand' | 'shorten' | 'improve' | 'fix-grammar', text: string }
 * Returns: { success: true, text: string }
 */
export const writingAssist = async (req, res) => {
  try {
    const { action, text } = req.body;

    if (!action || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: action and text",
      });
    }

    if (!ALLOWED_ACTIONS.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(", ")}`,
      });
    }

    const trimmedText = String(text).trim();
    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: "Text cannot be empty",
      });
    }

    if (trimmedText.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Text is too long (max ${MAX_INPUT_LENGTH} characters)`,
      });
    }

    const prompt = WRITING_PROMPTS[action];
    const messages = [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user(trimmedText) },
    ];

    const result = await callGroq(messages);

    res.status(200).json({
      success: true,
      text: result,
    });
  } catch (error) {
    console.error("AI writing assist error:", error);
    const message =
      error.message?.includes("GROQ_API_KEY")
        ? "AI service is not configured"
        : error.message || "AI writing assist failed";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
