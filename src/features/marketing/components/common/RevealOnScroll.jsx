import { memo, useEffect, useRef, useState } from "react";

const RevealOnScroll = memo(function RevealOnScroll({
  children,
  delay = 0,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.1 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-1000 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0"
      }`}
    >
      {children}
    </div>
  );
});

export default RevealOnScroll;
