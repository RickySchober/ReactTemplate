import React from "react";
import { cn } from "../lib/utils.js";
interface ButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded bg-blue-400 px-4 py-2 text-lg text-white transition-all hover:bg-blue-500",
        className
      )}
    >
      {children}
    </button>
  );
};
export default Button;
