import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../scroll.js";

// Counts up to a whole number when it first becomes visible. Final value is always the real one.
export default function Counter({ value }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShown(value);
      return;
    }
    const node = ref.current;
    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1200);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{shown.toLocaleString("en-US")}</span>;
}
