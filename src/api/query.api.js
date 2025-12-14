import api from "./axios";

export const sendQuery = (query, sessionId) => {
  return api.post("/query", {
    query,
    session_id: sessionId,
    show_timing: false,
  });
};
