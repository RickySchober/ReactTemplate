import { useState, useEffect } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    // base64-url -> base64
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);
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
    <div className="app-container" style={{ minHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 600 }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
          {isRegister ? 'Create an account' : 'Login'}
        </h2>

        {isRegister ? (
          <form onSubmit={tryRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '12px', fontSize: '1rem', borderRadius: 6 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '12px', fontSize: '1rem', borderRadius: 6 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '12px', fontSize: '1rem', borderRadius: 6 }}
            />
            <button type="submit" className="primary" style={{ padding: '10px 14px', fontSize: '1rem' }}>
              Register
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.95rem' }}>
              <button type="button" onClick={() => setIsRegister(false)} style={{ color: 'var(--accent)', textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Already have an account? Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '12px', fontSize: '1rem', borderRadius: 6 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '12px', fontSize: '1rem', borderRadius: 6 }}
            />
            <button type="submit" className="primary" style={{ padding: '10px 14px', fontSize: '1rem' }}>
              Login
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.95rem' }}>
              <button type="button" onClick={() => setIsRegister(true)} style={{ color: 'var(--accent)', textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Create an account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
