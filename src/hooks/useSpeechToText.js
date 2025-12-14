export const useSpeechToText = ({ onResult, onEnd, onError }) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListening = () => {
    if (!SpeechRecognition) {
      onError?.("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = () => {
      onError?.("Speech recognition error");
    };

    recognition.onend = () => {
      onEnd?.();
    };

    recognition.start();
  };

  return { startListening };
};
