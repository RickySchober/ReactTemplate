import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { tryRegister } from "../api/Register.js";

import Button from "@/components/Button.js";

interface RegisterProps {
  setIsRegister: (isRegister: boolean) => void;
}
const RegisterForm: React.FC<RegisterProps> = ({ setIsRegister }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const success = await tryRegister(username, email, password);
    if (success) navigate("/profile");
  }
  return (
    <form onSubmit={submitForm} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="rounded-md p-3 text-base"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md p-3 text-base"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-md p-3 text-base"
      />
      <Button type="submit" className="mb-2 bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500">
        Register
      </Button>
      <Button
        onClick={() => setIsRegister(false)}
        className="bg-transparent text-blue-400 underline hover:bg-transparent"
      >
        Already have an account? Login
      </Button>
    </form>
  );
};
export default RegisterForm;
