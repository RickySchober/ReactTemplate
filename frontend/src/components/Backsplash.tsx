/* Backsplash places children components above it with proper spacing
   with an image fading into the background to act as a nice page background.
*/
import * as React from "react";

interface BacksplashProps {
  children: React.ReactNode;
  heroHeight?: number;
  bgArt: string;
}

const Backsplash: React.FC<BacksplashProps> = ({
  children,
  heroHeight = 400,
  bgArt,
}) => {
  return (
    <>
      <div
        className="absolute inset-0 mt-20 bg-no-repeat bg-cover bg-center z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${bgArt})`,
          maskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-20 mt-60 mx-12">{children}</div>
    </>
  );
};
export default Backsplash;
