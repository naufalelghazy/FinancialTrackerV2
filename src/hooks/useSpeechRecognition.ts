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
  onFinalResult?: (transcript: string) => void;
}

export function useSpeechRecognition({
  lang = 'id-ID',
  onFinalResult,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalResultCallbackRef = useRef(onFinalResult);
  finalResultCallbackRef.current = onFinalResult;
  const lastTextRef = useRef('');

  useEffect(() => {
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition }).webkitSpeechRecognition;

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
          let currentFinal = '';
          let currentInterim = '';

          // Loop seluruh item hasil terkini
          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            const text = item[0]?.transcript || '';
            if (item.isFinal) {
              currentFinal += text + ' ';
            } else {
              currentInterim += text + ' ';
            }
          }

          const cleanedFinal = currentFinal.replace(/\s+/g, ' ').trim();
          const cleanedInterim = currentInterim.replace(/\s+/g, ' ').trim();

          // Hindari menumpuk ke prev state agar tidak menduplikasi kata di Android
          if (cleanedFinal) {
            setTranscript(cleanedFinal);
            finalResultCallbackRef.current?.(cleanedFinal);
          }

          setInterimTranscript(cleanedInterim);
          lastTextRef.current = (cleanedFinal + ' ' + cleanedInterim).trim();
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
      setError('Browser ini belum mendukung Web Speech API bawaan.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
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
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    lastTextRef.current = '';
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    fullText: (transcript + ' ' + interimTranscript).trim(),
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
