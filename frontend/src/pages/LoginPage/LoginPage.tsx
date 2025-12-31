import React, { useState } from "react";

import LoginForm from "./components/LoginForm.js";
import RegisterForm from "./components/RegisterForm.js";

import { useRedirectWhenLoggedIn } from "@/lib/hooks.js";

const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);

  useRedirectWhenLoggedIn();

  return (
    <div className="flex min-h-[72vh] items-center justify-center">
      <div className="card w-full max-w-lg">
        <h2 className="mb-5 text-center text-6xl font-bold">
          {isRegister ? "Create an account" : "Login"}
        </h2>
        {isRegister ? (
          <RegisterForm setIsRegister={setIsRegister} />
        ) : (
          <LoginForm setIsRegister={setIsRegister} />
        )}
      </div>
    </div>
  );
};
export default LoginPage;
