import { useEffect, useMemo, useState } from "react";

/**
 * Minimal fade transition between "views".
 */
export function useFadeSwitch<T>(key: string, view: T, durationMs = 180) {
  const [activeKey, setActiveKey] = useState(key);
  const [activeView, setActiveView] = useState(view);
  const [opacity, setOpacity] = useState(1);

  const transition = useMemo(() => `opacity ${durationMs}ms ease`, [durationMs]);

  useEffect(() => {
    if (key === activeKey) return;

    setOpacity(0);
    const t = window.setTimeout(() => {
      setActiveKey(key);
      setActiveView(view);
      setOpacity(1);
    }, durationMs);

    return () => window.clearTimeout(t);
  }, [key, view, durationMs, activeKey]);

  return { activeKey, activeView, opacity, transition };
}
