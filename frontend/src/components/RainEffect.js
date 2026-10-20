import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./rain-effect.css";

const raindrops = Array.from({ length: 54 }, (_, index) => {
  const duration = 2.8 + Math.random() * 2.2;
  return {
    id: `rain-${index}`,
    style: {
      "--rain-x": `${Math.random() * 100}%`,
      "--rain-length": `${12 + Math.random() * 16}px`,
      "--rain-angle": `${-8 - Math.random() * 9}deg`,
      "--rain-duration": `${duration}s`,
      "--rain-delay": `${-(Math.random() * duration)}s`,
      "--rain-opacity": `${0.2 + Math.random() * 0.34}`,
      "--rain-drift": `${4 + Math.random() * 8}vw`,
    },
  };
});

export default function RainEffect() {
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === "visible");

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!isVisible) return null;

  return createPortal(
    <div className="rain-backdrop" aria-hidden="true" data-testid="rain-backdrop">
      {raindrops.map(({ id, style }) => (
        <span className="rain-drop" key={id} style={style}>
          <span className="rain-streak" />
        </span>
      ))}
    </div>,
    document.body,
  );
}
