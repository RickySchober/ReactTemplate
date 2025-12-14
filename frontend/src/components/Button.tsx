import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="rounded bg-blue-400 px-4 py-2 text-lg text-white transition-all hover:bg-blue-500"
    >
      {children}
    </button>
  );
};
export default Button;
