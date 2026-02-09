import React from "react";
import { Routes } from "react-router-dom";

import Button from "@/components/Button.js";

export default function App() {
  return (
    <>
      <Routes></Routes>
      <Button>fix</Button>
      <button className="rounded bg-blue-500 px-4 py-2 text-white">fix</button>
    </>
  );
}
