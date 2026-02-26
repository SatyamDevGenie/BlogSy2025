import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, Expand, Shrink, Wand2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { aiAPI } from "../utils/api";

const ACTIONS = [
  { id: "expand", label: "Expand", icon: Expand, description: "Make it longer and more detailed" },
  { id: "shorten", label: "Shorten", icon: Shrink, description: "Make it more concise" },
  { id: "improve", label: "Improve tone", icon: Wand2, description: "Better clarity and flow" },
  { id: "fix-grammar", label: "Fix grammar", icon: CheckCircle, description: "Fix spelling & punctuation" },
];

export default function AiWritingAssist({ contentRef, value, onChange, darkMode = false }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const getTextToProcess = () => {
    if (!contentRef?.current) return value || "";
    const ta = contentRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start !== end && end > start) {
      return value?.slice(start, end) || "";
    }
    return value || "";
  };

  const applyResult = (newText) => {
    if (!onChange) return;
    if (contentRef?.current) {
      const ta = contentRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const hasSelection = end > start;
      if (hasSelection && value != null) {
        const before = value.slice(0, start);
        const after = value.slice(end);
        onChange(before + newText + after);
      } else {
        onChange(newText);
      }
    } else {
      onChange(newText);
    }
  };

  const handleAction = async (actionId) => {
    const text = getTextToProcess().trim();
    if (!text) {
      toast.info("Select some text in the content box, or type something first.");
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(false);
    try {
      const res = await aiAPI.writingAssist({ action: actionId, text });
      const resultText = res.data?.text ?? res?.text;
      if (resultText) {
        applyResult(resultText);
        toast.success("AI applied successfully!");
      } else {
        toast.error("No result from AI.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "AI assist failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const baseClasses = darkMode
    ? "bg-gray-800 border-gray-600 text-gray-200"
    : "bg-white border-gray-200 text-gray-800";

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${baseClasses} hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className={`w-4 h-4 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
          )}
          <span>AI Assist</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            className={`absolute left-0 top-full mt-1 z-20 w-72 rounded-xl border shadow-xl ${baseClasses}`}
          >
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Select text to refine, or use full content
              </p>
            </div>
            <ul className="p-2 space-y-0.5">
              {ACTIONS.map(({ id, label, icon: Icon, description }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => handleAction(id)}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-200"
                        : "hover:bg-gray-100 text-gray-800"
                    } disabled:opacity-50`}
                  >
                    <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium">{label}</span>
                      <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {description}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
