import { useState, useEffect, useRef } from "react";

export function useTypewriter(
  text,
  speed = 50,
  delay = 0,
  loop = false
) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    let timeout;

    const startTyping = () => {
      setIsTyping(true);
      indexRef.current = 0;
      setDisplayedText("");
    };

    timeout = setTimeout(startTyping, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  useEffect(() => {
    if (!isTyping) return;

    if (indexRef.current < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      }, speed);
      return () => clearTimeout(timeout);
    }

    // Typing finished
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (loop) {
        indexRef.current = 0;
        setDisplayedText("");
        setIsTyping(true);
      }
    }, loop ? 2000 : 0);

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, text, speed, loop]);

  return { displayedText, isTyping };
}

export function useCountUp(target, duration = 1500, start = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return value;
}

export function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export function useKonamiCode(callback) {
  const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  const indexRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === sequence[indexRef.current]) {
        indexRef.current++;
        if (indexRef.current === sequence.length) {
          callback();
          indexRef.current = 0;
        }
      } else {
        indexRef.current = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback]);
}

export function useIdleDetection(timeout = 30000, onIdle) {
  const [idleTime, setIdleTime] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    const resetIdle = () => {
      setIdleTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIdleTime((prev) => {
          const next = prev + 1000;
          if (next >= timeout && onIdle) onIdle();
          return next;
        });
      }, 1000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdle));
    resetIdle();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeout, onIdle]);

  return idleTime;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch (e2) {
      return defaultValue;
    }
  });

  const setStored = (newValue) => {
    setValue(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [value, setStored];
}
