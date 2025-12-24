import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useRedirectWhenLoggedIn() {
  const navigate = useNavigate();
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
    } catch {
      return null;
    }
  }
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
    localStorage.removeItem("token");
  }, [navigate]);
}
// Use local storage to persist a boolean state. True if key exists, false otherwise.
export function useLocalStorageState(
  key: string
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [state, setState] = useState<boolean>(() => {
    return localStorage.getItem(key) !== null;
  });

  useEffect(() => {
    if (state) {
      localStorage.setItem(key, "true");
    } else {
      localStorage.removeItem(key);
    }
  }, [key, state]);

  return [state, setState];
}
