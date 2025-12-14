let selectedVoice = null;

/**
 * Load and lock a single voice for the session
 */
const loadAndLockVoice = () => {
    return new Promise((resolve) => {
        const synth = window.speechSynthesis;
        let voices = synth.getVoices();

        if (voices.length) {
            resolve(voices);
        } else {
            synth.onvoiceschanged = () => {
                resolve(synth.getVoices());
            };
        }
    });
};

export const speakText = async (text, onEnd) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // 🔒 Lock voice only once
    if (!selectedVoice) {
        const voices = await loadAndLockVoice();

        selectedVoice =
            voices.find(
                (v) =>
                    v.lang === "en-US" &&
                    (v.name.toLowerCase().includes("google") ||
                        v.name.toLowerCase().includes("samantha") ||
                        v.name.toLowerCase().includes("alex"))
            ) ||
            voices.find((v) => v.lang === "en-US") ||
            voices[0];
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = "en-US";

    // 🎛 Natural tuning
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
        onEnd?.();
    };

    utterance.onerror = () => {
        onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
};
