/* Backsplash places children components above it with proper spacing
   with an image fading into the background to act as a nice page background.
*/
import * as React from "react";

interface BacksplashProps {
  children: React.ReactNode;
  bgArt: string;
}

const Backsplash: React.FC<BacksplashProps> = ({ children, bgArt }) => {
  return (
    <>
      <div
        className="mt-18 pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgArt})`,
          maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-20 mx-12 mt-60">{children}</div>
    </>
  );
};
export default Backsplash;
