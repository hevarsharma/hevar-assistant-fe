import { useState } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { sendQuery } from "../api/query.api";
import { getSessionId } from "../utils/session";
import { speakText, stopSpeaking } from "../utils/tts";

export default function AssistantBox() {
  const [status, setStatus] = useState("idle");
  // idle | listening | processing | speaking
  const [error, setError] = useState("");

  const { startListening } = useSpeechToText({
    onResult: async (text) => {
      try {
        // user finished speaking → API starts
        setStatus("processing");

        const sessionId = getSessionId();
        const res = await sendQuery(text, sessionId);
        const reply = res.data.text || res.data.full_response;

        if (reply) {
          // API done → speaking
          setStatus("speaking");
          speakText(reply, () => {
            // speech finished → back to idle
            setStatus("idle");
          });
        } else {
          setStatus("idle");
        }
      } catch (err) {
        setError("Failed to process query");
        setStatus("idle");
      }
    },

    onEnd: () => {
      // mic stopped after listening
      if (status === "listening") {
        setStatus("processing");
      }
    },

    onError: (err) => {
      setError(err);
      setStatus("idle");
    },
  });

  const handleClick = () => {
    if (status !== "idle") return;

    stopSpeaking();
    setError("");
    setStatus("listening");
    startListening();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {(status === "listening" || status === "speaking") && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#5F7482]/40"></span>
        )}

        <div
          onClick={handleClick}
          className={`relative z-10 flex items-center justify-center cursor-pointer select-none
            transition-all duration-500
            ${status === "listening" || status === "speaking"
              ? "w-40 h-40 rounded-full"
              : "w-80 h-40 rounded-xl"
            }
            bg-[#5F7482]`}
        >
          {(status === "idle" || status === "processing") && (
            <span className="text-xl font-semibold text-white">
              Hevar Assistant
            </span>
          )}
        </div>
      </div>

      {status === "listening" && (
        <span className="text-sm text-[#5F7482]">Listening…</span>
      )}

      {status === "speaking" && (
        <span className="text-sm text-[#5F7482]">Speaking…</span>
      )}

      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
