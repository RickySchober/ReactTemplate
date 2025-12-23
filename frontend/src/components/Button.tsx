/* Custom Button component with default styling used accross the application.
   Additional styling can be passed via the className prop and also override default styling.
*/
import React from "react";
import { cn } from "@/lib/utils.js";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button
      className={cn(
        "cursor-pointer rounded bg-blue-400 px-4 py-2 text-lg text-white transition-all hover:bg-blue-500",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
