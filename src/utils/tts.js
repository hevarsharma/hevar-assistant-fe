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

/**
 * Ensures we have a voice selected before speaking.
 */
const ensureVoice = async () => {
    if (!window.speechSynthesis) return null;

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
    return selectedVoice;
};

/**
 * Simple queue to play audio chunks sequentially
 */
class AudioQueue {
    constructor() {
        this.queue = [];
        this.isPlaying = false;
    }

    add(text, onEnd) {
        this.queue.push({ text, onEnd });
        if (!this.isPlaying) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const { text, onEnd } = this.queue.shift();

        await new Promise((resolve) => {
            speakText(text, () => {
                onEnd?.();
                resolve();
            });
        });

        this.processQueue();
    }

    clear() {
        this.queue = [];
        this.isPlaying = false;
        stopSpeaking();
    }
}

export const audioQueue = new AudioQueue();

export const speakText = async (text, onEnd) => {
    if (!window.speechSynthesis) {
        onEnd?.();
        return;
    }

    // Ensure not to cancel running speech if this is part of a queue, 
    // BUT since this is a low-level function, standard usage might expect cancellation.
    // Ideally, for queuing, we don't satisfy `window.speechSynthesis.cancel()` here 
    // if we are running from the queue. 
    // For now, let's trust the Caller to call stopSpeaking() if they want a hard stop.
    // Otherwise, we just queue an utterance.
    // ACTUAL FLUSH:
    // If we want "speakText" to interrupt everything, we should cancel.
    // But for streaming, we use AudioQueue which calls this sequentially.
    // So we should NOT cancel inside speakText blindly if we want to queue manually?
    // Compromise: `speakText` will interrupting by default (legacy behavior), 
    // but `AudioQueue` will manage serializing.
    // ACTUALLY: speech API IS asynchronous. If we fire speak(), it adds to browser internal queue.
    // BUT we found browser queue unreliable for long texts or chunks in some browsers.
    // SO we stick to our AudioQueue.

    // To prevent overlap from previous "thinking" or interrupted states:
    // We actually rely on `window.speechSynthesis.speaking` checks or just cancel if not queued. 
    // However, for this helper let's keep it simple: It plays ONE utterance. 
    // If the browser is speaking, calling speak() queues it in the browser's native queue usually.
    // But we want manual control for events.

    // For safety in this specific "Assistant" context:
    // We assume the caller manages the "stop everything" via `stopSpeaking`.

    const voice = await ensureVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
        onEnd?.();
    };

    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
};

