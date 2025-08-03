import { useState, useEffect, useRef, useCallback } from "react";

interface UseContentTransitionOptions {
  duration?: number;
  type?: "default" | "swap" | "quick";
  key?: string | number;
}

export function useContentTransition<T>(
  content: T,
  options: UseContentTransitionOptions = {}
) {
  const { duration = 300, type = "default" } = options;
  const [displayContent, setDisplayContent] = useState(content);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (content !== displayContent) {
      setIsTransitioning(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDisplayContent(content);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, duration / 2);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, displayContent, duration]);

  const getTransitionClasses = useCallback(() => {
    const baseClass =
      type === "swap"
        ? "content-swap"
        : type === "quick"
          ? "content-quick-swap"
          : "content-transition";

    const fadeClass = isTransitioning
      ? type === "swap"
        ? "content-swap-out"
        : type === "quick"
          ? "content-quick-out"
          : "content-fade-out"
      : type === "swap"
        ? "content-swap-in"
        : type === "quick"
          ? "content-quick-in"
          : "content-fade-in";

    return `${baseClass} ${fadeClass}`;
  }, [type, isTransitioning]);

  return {
    displayContent,
    isTransitioning,
    transitionClasses: getTransitionClasses(),
    TransitionWrapper: ({
      children,
      className = "",
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div className={`${getTransitionClasses()} ${className}`} {...props}>
        {children}
      </div>
    ),
  };
}
