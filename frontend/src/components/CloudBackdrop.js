import { createPortal } from "react-dom";
import "./cloud-backdrop.css";

const clouds = [
  { id: "cloud-one", direction: "left-to-right", size: "large", position: "high", delay: "-28s" },
  { id: "cloud-two", direction: "right-to-left", size: "small", position: "upper", delay: "-52s" },
  { id: "cloud-three", direction: "left-to-right", size: "small", position: "middle", delay: "-71s" },
  { id: "cloud-four", direction: "right-to-left", size: "large", position: "low", delay: "-94s" },
  { id: "cloud-five", direction: "left-to-right", size: "medium", position: "lower", delay: "-116s" },
];

export default function CloudBackdrop() {
  return createPortal(
    <div className="cloud-backdrop" aria-hidden="true" data-testid="cloud-backdrop">
      {clouds.map((cloud) => (
        <span
          className={`drifting-cloud ${cloud.direction} ${cloud.size} ${cloud.position}`}
          key={cloud.id}
          style={{ animationDelay: cloud.delay }}
        >
          <span />
        </span>
      ))}
    </div>,
    document.body,
  );
}
