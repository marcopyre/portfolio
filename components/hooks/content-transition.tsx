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
  const { duration = 300, type = "default", key } = options;
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
      [key: string]: any;
    }) => (
      <div className={`${getTransitionClasses()} ${className}`} {...props}>
        {children}
      </div>
    ),
  };
}

export function useMultipleContentTransitions() {
  const transitions = useRef<Map<string | number, any>>(new Map());

  const createTransition = useCallback(
    <T,>(
      key: string | number,
      content: T,
      options: UseContentTransitionOptions = {}
    ) => {
      const transitionKey = `${key}-${JSON.stringify(options)}`;

      if (!transitions.current.has(transitionKey)) {
        transitions.current.set(transitionKey, { content, options });
      }

      return useContentTransition(content, { ...options, key });
    },
    []
  );

  const getTransition = useCallback((key: string | number) => {
    return transitions.current.get(key);
  }, []);

  return { createTransition, getTransition };
}

interface ContentTransitionItemProps<T> {
  content: T;
  index: number;
  options?: UseContentTransitionOptions;
  className?: string;
  children: (
    content: T,
    transitionClasses: string,
    isTransitioning: boolean
  ) => React.ReactNode;
}

export function ContentTransitionItem<T>({
  content,
  index,
  options = {},
  className = "",
  children,
}: ContentTransitionItemProps<T>) {
  const { displayContent, transitionClasses, isTransitioning } =
    useContentTransition(content, { ...options, key: index });

  return (
    <div className={`${transitionClasses} ${className}`}>
      {children(displayContent, transitionClasses, isTransitioning)}
    </div>
  );
}
