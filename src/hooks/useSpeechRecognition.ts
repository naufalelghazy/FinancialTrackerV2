import { useState, useEffect, useRef, useCallback } from 'react';

// Declarations for browser SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  autoStopOnSilence?: boolean;
  silenceTimeoutMs?: number;
  onFinalResult?: (transcript: string) => void;
}

function getSpeechRecognitionClass(): (new () => ISpeechRecognition) | undefined {
  if (typeof window === 'undefined') return undefined;
  return (
    (window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition })
      .webkitSpeechRecognition
  );
}

function deduplicateRepeatingPhrases(text: string): string {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return text.trim();

  // Bersihkan repetisi n-gram berurutan (1 kata, 2 kata, 3 kata, dst.)
  for (let phraseLen = Math.min(6, Math.floor(words.length / 2)); phraseLen >= 1; phraseLen--) {
    let i = 0;
    while (i + 2 * phraseLen <= words.length) {
      const first = words.slice(i, i + phraseLen).join(' ').toLowerCase();
      const second = words.slice(i + phraseLen, i + 2 * phraseLen).join(' ').toLowerCase();
      if (first === second) {
        words.splice(i + phraseLen, phraseLen);
      } else {
        i++;
      }
    }
  }

  return words.join(' ');
}

export function useSpeechRecognition({
  lang = 'id-ID',
  autoStopOnSilence = true,
  silenceTimeoutMs = 1700,
  onFinalResult,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(() =>
    getSpeechRecognitionClass() ? null : 'Browser ini belum mendukung Web Speech API bawaan.'
  );
  const [isSupported] = useState(() => Boolean(getSpeechRecognitionClass()));

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalResultCallbackRef = useRef(onFinalResult);
  const lastTextRef = useRef('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    finalResultCallbackRef.current = onFinalResult;
  }, [onFinalResult]);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const finalChunks: string[] = [];
          const interimChunks: string[] = [];

          // Android Chrome bisa mengirim hasil kumulatif di setiap event.results[i]
          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            const text = (item[0]?.transcript || '').trim();
            if (!text) continue;

            const targetList = item.isFinal ? finalChunks : interimChunks;

            if (targetList.length === 0) {
              targetList.push(text);
            } else {
              const prev = targetList[targetList.length - 1];
              const prevLower = prev.toLowerCase();
              const currLower = text.toLowerCase();

              // Jika teks baru perpanjangan dari teks sebelumnya, ganti item terakhir
              if (currLower.startsWith(prevLower)) {
                targetList[targetList.length - 1] = text;
              } else if (prevLower.endsWith(currLower) || prevLower.includes(currLower)) {
                // Sudah ada di teks sebelumnya, abaikan
              } else {
                targetList.push(text);
              }
            }
          }

          let cleanedFinal = finalChunks.join(' ').replace(/\s+/g, ' ').trim();
          let cleanedInterim = interimChunks.join(' ').replace(/\s+/g, ' ').trim();

          // Bersihkan sisa pengulangan kata berturut-turut khas speech engine Android
          cleanedFinal = deduplicateRepeatingPhrases(cleanedFinal);
          cleanedInterim = deduplicateRepeatingPhrases(cleanedInterim);

          if (cleanedFinal) {
            setTranscript(cleanedFinal);
            finalResultCallbackRef.current?.(cleanedFinal);
          }

          setInterimTranscript(cleanedInterim);
          const fullSoFar = (cleanedFinal + ' ' + cleanedInterim).trim();
          lastTextRef.current = fullSoFar;

          // Single-shot auto-stop saat hening setelah ada ucapan
          if (autoStopOnSilence && fullSoFar) {
            clearSilenceTimer();
            silenceTimerRef.current = setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch {}
              }
            }, silenceTimeoutMs);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          clearSilenceTimer();
          if (event.error === 'no-speech') {
            // Pengguna diam / tidak ada suara, jangan error fatal
            return;
          }
          if (event.error === 'not-allowed') {
            setError('Izin akses mikrofon ditolak oleh browser. Harap aktifkan izin mikrofon.');
          } else if (event.error === 'audio-capture') {
            setError('Mikrofon tidak terdeteksi atau sedang digunakan aplikasi lain.');
          } else {
            setError(`Kendala pengenalan suara: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          clearSilenceTimer();
          setIsListening(false);
          setInterimTranscript('');
          // Amankan ucapan terakhir jika item tidak berstatus isFinal sebelum onend
          if (lastTextRef.current) {
            setTranscript((prev) => prev || lastTextRef.current);
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to initialize SpeechRecognition:', err);
      }
    }

    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [lang, autoStopOnSilence, silenceTimeoutMs]);

  const startListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    lastTextRef.current = '';

    try {
      recognitionRef.current.start();
    } catch {
      // Jika sudah running, restart
      try {
        recognitionRef.current.abort();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } catch (err) {
        console.error('Could not start recognition:', err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Could not stop recognition:', err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setTranscript('');
    setInterimTranscript('');
    lastTextRef.current = '';
    setError(null);
  }, []);

  const fullText = `${transcript} ${interimTranscript}`.trim();

  return {
    isListening,
    transcript,
    interimTranscript,
    fullText,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
