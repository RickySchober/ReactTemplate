/* Stylized toggle switch to toggle between 2 options.
 */
import * as React from "react";

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  id?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value = false,
  onChange,
  leftLabel = "On",
  rightLabel = "Off",
  id,
}) => {
  const width = 250;
  const height = 45;
  const padding = 0;
  const knobWidth = width / 2 - padding * 2;
  const knobHeight = height - padding * 2;
  return (
    <div className="inline-flex items-center gap-2">
      <button
        className="no-bob relative inline-block cursor-pointer overflow-hidden bg-gray-500 p-0"
        id={id}
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onChange(false);
          if (e.key === "ArrowRight") onChange(true);
        }}
        style={{
          width,
          height,
          borderRadius: height / 10,
          border: "1px solid rgba(255, 255, 255, 0.48)",
        }}
      >
        <div className="relative z-20 flex h-full w-full items-center justify-between text-sm font-bold">
          <span
            style={{
              fontWeight: 550,
              fontSize: 20,
              width: "50%",
              textAlign: "center",
              color: value ? "var(--text)" : "rgba(8, 183, 241, 1)",
              pointerEvents: "none",
            }}
          >
            {leftLabel}
          </span>
          <span
            style={{
              fontWeight: 550,
              fontSize: 20,
              width: "50%",
              textAlign: "center",
              color: value ? "rgba(8, 183, 241, 1)" : "var(--text)",
              pointerEvents: "none",
            }}
          >
            {rightLabel}
          </span>
        </div>

        {/* sliding white box knob */}
        <div
          className="absolute top-0 z-10 flex items-center bg-white px-2"
          style={{
            width: knobWidth,
            height: knobHeight,
            borderRadius: knobHeight / 10,
            top: padding,
            left: value ? width - knobWidth - padding : padding,
            transition: "left 380ms cubic-bezier(.2,.9,.2,1), box-shadow 120ms",
            justifyContent: value ? "flex-end" : "flex-start",
          }}
        ></div>
      </button>
    </div>
  );
};
export default ToggleSwitch;
