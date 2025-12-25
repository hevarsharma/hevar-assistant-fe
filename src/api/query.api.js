import api from "./axios";

export const sendQuery = (query, sessionId) => {
  return api.post("/query", {
    query,
    session_id: sessionId,
    show_timing: false,
  });
};

export const streamQuery = async (query, sessionId, onChunk, onEnd, onError) => {
  try {
    const token = sessionStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || "https://api.hevarassistantbackend.site"}/query/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        session_id: sessionId,
        show_timing: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Split by double newlines which typically separate SSE messages
      // We also handle single newlines if that's how the server sends them, 
      // but standard SSE uses \n\n between events.
      // Based on logs: "event: message\r\ndata: ...\r\n\r\n"

      const lines = buffer.split(/\r?\n/);
      // Keep the last line in buffer as it might be incomplete
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6); // Remove "data: "

          if (data.trim() === "Stream complete") {
            continue;
          }

          if (data) {
            onChunk(data);
          }
        }
      }
    }

    onEnd?.();
  } catch (error) {
    console.error("Streaming Error:", error);
    onError?.(error);
  }
};
