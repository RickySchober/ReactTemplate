/* Custom Button component with default styling used accross the application.
   Additional styling can be passed via the className prop and also override default styling.
*/
import React from "react";

import { cn } from "@/lib/utils.js";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  variant?: "toolbar" | "primary";
}
const baseStyles = "cursor-pointer rounded transition-all";

const variantStyles = {
  default: "",
  toolbar: "hover:bg-gray-100 px-2 py-0.5 text-sm text-gray-700",
  primary: "bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white",
};
const Button: React.FC<ButtonProps> = ({ className, children, variant = "default", ...props }) => {
  return (
    <button className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </button>
  );
};
export default Button;
