import { useState, useEffect } from "react";
import api from "../api/client.js";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import { redirectWhenLoggedIn } from "../lib/hooks.js";
import Button from "../components/Button.js";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const navigate = useNavigate();

  redirectWhenLoggedIn();

  async function tryRegister(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/signup", null, {
        params: { username, email, password },
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/profile");
    } catch (err) {
      alert("Registration failed");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", null, {
        params: { email, password },
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/profile");
    } catch (err) {
      alert("Login failed");
    }
  }

  return (
    <div className="flex min-h-[72vh] items-center justify-center">
      <div className="card w-full max-w-lg">
        <h2 className="mb-5 text-center text-6xl font-bold">
          {isRegister ? "Create an account" : "Login"}
        </h2>
        {isRegister ? (
          <RegisterForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            setIsRegister={setIsRegister}
            username={username}
            setUsername={setUsername}
            tryRegister={tryRegister}
          />
        ) : (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            setIsRegister={setIsRegister}
            handleLogin={handleLogin}
          />
        )}
      </div>
    </div>
  );
};
export default LoginPage;

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setIsRegister: (isRegister: boolean) => void;
  handleLogin: (e: React.FormEvent) => void;
}
const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  setIsRegister,
  handleLogin,
}) => {
  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="mb-2 bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500">
        Login
      </button>
      <button
        type="button"
        onClick={() => setIsRegister(true)}
        className="cursor-pointer border-none bg-transparent text-lg text-blue-400 underline"
      >
        Create an account
      </button>
    </form>
  );
};
interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  username: string;
  setUsername: (username: string) => void;
  setIsRegister: (isRegister: boolean) => void;
  tryRegister: (e: React.FormEvent) => void;
}
const RegisterForm: React.FC<RegisterFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  setIsRegister,
  tryRegister,
}) => {
  return (
    <form onSubmit={tryRegister} className="flex flex-col gap-3">
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
      <button type="submit" className="mb-2 bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500">
        Register
      </button>
      <button
        type="button"
        onClick={() => setIsRegister(false)}
        className="cursor-pointer border-none bg-transparent text-lg text-blue-400 underline"
      >
        Already have an account? Login
      </button>
    </form>
  );
};
