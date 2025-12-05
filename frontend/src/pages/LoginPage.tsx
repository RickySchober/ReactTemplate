import { useState, useEffect } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import * as React from "react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = parseJwt(token);
    if (payload && payload.exp) {
      const now = Date.now() / 1000;
      if (payload.exp > now) {
        navigate("/");
        return;
      }
    }
    // token missing / invalid / expired -> remove it
    localStorage.removeItem("token");
  }, [navigate]);

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
            <button
              type="submit"
              className="mb-2 bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500"
            >
              Register
            </button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="cursor-pointer border-none bg-transparent text-lg text-blue-400 underline"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
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
            <button
              type="submit"
              className="mb-2 bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500"
            >
              Login
            </button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="cursor-pointer border-none bg-transparent text-lg text-blue-400 underline"
              >
                Create an account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default LoginPage;

//Helper function for parsing token
function parseJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
