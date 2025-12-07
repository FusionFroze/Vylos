export default function useTextToSpeech() {
  const speak = (text) => {
    // Cancel any previous speech immediately
    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    // If the utterance object is garbage collected during speech, it stops abruptly.
    // Attaching it to window prevents this.
    window.voiceWebUtterance = utter;

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find(
        (v) => v.lang === "en-US" && v.name.includes("Google")
      );
      if (preferred) utter.voice = preferred;
    }

    // Cleanup reference when done
    utter.onend = () => {
      window.voiceWebUtterance = null;
    };

    speechSynthesis.speak(utter);
  };

  const stop = () => {
    speechSynthesis.cancel();
  };

  return { speak, stop };
}
