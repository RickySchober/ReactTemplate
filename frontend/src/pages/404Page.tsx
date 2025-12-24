import React from "react";

import NavBar from "@/components/NavBar.js";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f1720] text-white">
      <NavBar />
      <div className="z-90 fixed mt-20 flex h-full w-full flex-col items-center justify-center gap-8 bg-slate-900">
        <p className="text-6xl font-medium">404 Page Not Found</p>
        <p className="text-2xl font-medium">Invalid url, trade, or card ID</p>
      </div>
    </div>
  );
};
export default NotFoundPage;
