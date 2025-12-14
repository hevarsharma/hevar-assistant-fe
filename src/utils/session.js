export const createSessionId = () => {
  const sessionId = `session_${crypto.randomUUID()}`;
  sessionStorage.setItem("session_id", sessionId);
  return sessionId;
};

export const getSessionId = () => {
  return sessionStorage.getItem("session_id");
};

export const initSession = () => {
  const sessionId = `session_${crypto.randomUUID()}`;
  sessionStorage.setItem("session_id", sessionId);
};

