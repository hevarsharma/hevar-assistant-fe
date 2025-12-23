import { useState, useRef } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { sendQuery, streamQuery } from "../api/query.api";
import { getSessionId } from "../utils/session";
import { speakText, stopSpeaking, audioQueue } from "../utils/tts";
import { thinkingPhrases } from "../constants/thinkingPhrases";

const USE_STREAMING = true; // Toggle this to switch modes

export default function AssistantBox() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  // Ref to track if we should stop processing (e.g. user interrupted)
  const isCancelledRef = useRef(false);

  const processRestQuery = async (text, sessionId) => {
    try {
      const res = await sendQuery(text, sessionId);
      const reply = res.data.text || res.data.full_response;

      if (!reply || isCancelledRef.current) {
        setStatus("idle");
        return;
      }

      // Safely transition to speaking
      setStatus("speaking");

      // Use the queue even for REST to ensure consistent behavior
      audioQueue.add(reply, () => {
        if (!isCancelledRef.current) {
          setStatus("idle");
        }
      });

    } catch (err) {
      console.error(err);
      setError("Failed to process query");
      setStatus("idle");
    }
  };

  const processStreamingQuery = async (text, sessionId) => {
    let currentSentence = "";

    await streamQuery(
      text,
      sessionId,
      (chunk) => {
        if (isCancelledRef.current) return;

        // Simple accumulation - in a real app, you might want more sophisticated NLP sentence detection
        currentSentence += chunk;

        // Basic sentence detection to stream audio chunks naturally
        // Check for punctuation that suggests a pause or end of sentence
        if (/[.!?]/.test(chunk) || currentSentence.length > 100) {
          // If we have a decent chunk, add to queue
          // Ideally we split by the punctuation
          const parts = currentSentence.split(/([.!?]+)/);

          // We might have "Hello world! How are" -> ["Hello world", "!", " How are"]
          // Process all complete sentences
          while (parts.length > 1) {
            const sentence = parts.shift() + (parts.shift() || "");
            if (sentence.trim()) {
              if (status !== "speaking") setStatus("speaking");
              audioQueue.add(sentence.trim());
            }
          }

          // Keep the remainder
          currentSentence = parts.join("");
        }
      },
      () => {
        // Stream ended
        if (currentSentence.trim() && !isCancelledRef.current) {
          if (status !== "speaking") setStatus("speaking");
          audioQueue.add(currentSentence.trim(), () => {
            // Only reset to idle when the LAST audio chunk finishes
            setStatus("idle");
          });
        } else {
          // If nothing left, we are done
          // But we need to know when audioQueue finishes...
          // AudioQueue doesn't have a global "empty" listener easily here unless we add a dummy
          audioQueue.add("", () => setStatus("idle"));
        }
      },
      (err) => {
        console.error(err);
        setError("Streaming failed");
        setStatus("idle");
      }
    );
  };

  const { startListening } = useSpeechToText({
    onResult: async (text) => {
      try {
        isCancelledRef.current = false;
        setStatus("processing");
        setError("");

        // 1️⃣ Thinking phrase
        const thinking =
          thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];

        // Speak thinking phrase immediately
        // We use speakText directly or queue it? Queue is safer.
        audioQueue.add(thinking);

        const sessionId = getSessionId();

        if (USE_STREAMING) {
          await processStreamingQuery(text, sessionId);
        } else {
          await processRestQuery(text, sessionId);
        }

      } catch (err) {
        setError("Failed to process query");
        setStatus("idle");
      }
    },

    onEnd: () => {
      // mic ended naturally
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
    // 🔴 Interrupt speaking
    if (status === "speaking" || status === "processing") {
      isCancelledRef.current = true;
      stopSpeaking();
      audioQueue.clear();
      setStatus("idle");
      return;
    }

    if (status !== "idle") return;

    setError("");
    setStatus("listening");
    startListening();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {(status === "listening" || status === "speaking" || status === "processing") && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#5F7482]/40"></span>
        )}

        <div
          onClick={handleClick}
          className={`relative z-10 flex items-center justify-center cursor-pointer select-none
            transition-all duration-500
            ${status === "listening" || status === "speaking" || status === "processing"
              ? "w-40 h-40 rounded-full"
              : "w-80 h-40 rounded-xl"
            }
            bg-[#5F7482]`}
        >
          {(status === "idle") && (
            <span className="text-xl font-semibold text-white">
              Hevar Assistant
            </span>
          )}

          {status === "processing" && (
            <span className="text-xl font-semibold text-white animate-pulse">
              Thinking...
            </span>
          )}

          {status === "speaking" && (
            <span className="text-xl font-semibold text-white">
              Speaking...
            </span>
          )}

          {status === "listening" && (
            <span className="text-xl font-semibold text-white">
              Listening...
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

      {status === "processing" && (
        <span className="text-sm text-[#5F7482]">Processing…</span>
      )}

      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
