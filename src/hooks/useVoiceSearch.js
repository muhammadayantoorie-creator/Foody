import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API voice hook — supports Urdu (ur-PK) and English (en-US)
export function useVoiceSearch({ onResult, onCommand, language = 'en-US' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported] = useState(() =>
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );

  const recognitionRef = useRef(null);

  // Voice commands map
  const COMMANDS = {
    en: {
      'go to orders': () => window.location.href = '/my-orders',
      'open cart': () => document.getElementById('cart-trigger')?.click(),
      'go home': () => window.location.href = '/dashboard',
      'checkout': () => window.location.href = '/checkout',
      'open settings': () => document.dispatchEvent(new CustomEvent('open-settings')),
      'open help': () => document.dispatchEvent(new CustomEvent('open-help')),
      'dark mode': () => document.dispatchEvent(new CustomEvent('toggle-dark')),
      'light mode': () => document.dispatchEvent(new CustomEvent('toggle-dark')),
    },
    ur: {
      'آرڈر': () => window.location.href = '/my-orders',
      'کارٹ': () => document.getElementById('cart-trigger')?.click(),
      'ہوم': () => window.location.href = '/dashboard',
      'چیک آؤٹ': () => window.location.href = '/checkout',
    },
  };

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice recognition not supported in this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          final += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      const currentTranscript = final || interim;
      setTranscript(currentTranscript);

      if (final) {
        // Check for commands
        const cmdMap = language.startsWith('ur') ? COMMANDS.ur : COMMANDS.en;
        const lowerFinal = final.toLowerCase().trim();
        
        let commandFound = false;
        for (const [cmd, action] of Object.entries(cmdMap)) {
          if (lowerFinal.includes(cmd.toLowerCase())) {
            action();
            if (onCommand) onCommand(cmd, final);
            commandFound = true;
            break;
          }
        }

        if (!commandFound && onResult) {
          onResult(final.trim());
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow mic permission in browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please speak clearly.');
      } else {
        setError('Voice recognition error: ' + event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [isSupported, language, onResult, onCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Text-to-Speech
  const speak = useCallback((text, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
