export const streamQuery = async ({
  query,
  sessionId,
  token,
  onMessage,
  onDone,
  onError,
}) => {
  try {
    const res = await fetch("http://20.174.12.87:8000/query/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        session_id: sessionId,
        show_timing: false,
      }),
    });

    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let currentEvent = "message";
    let currentData = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.replace("event:", "").trim();
        }

        if (line.startsWith("data:")) {
          currentData += line.replace("data:", "").trim() + " ";
        }

        // 🔑 Empty line = event boundary (even if backend doesn’t flush \n\n properly)
        if (line.trim() === "") {
          if (currentEvent === "message" && currentData.trim()) {
            onMessage?.(currentData.trim());
          }

          if (currentEvent === "done") {
            onDone?.();
          }

          if (currentEvent === "error") {
            onError?.(currentData.trim());
          }

          // reset
          currentEvent = "message";
          currentData = "";
        }
      }
    }
  } catch (err) {
    console.error("Streaming failed:", err);
    onError?.(err);
  }
};
