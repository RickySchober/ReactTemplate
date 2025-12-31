import api from "@/api/client.js";

export async function tryLogin(email: string, password: string): Promise<boolean> {
  try {
    const res = await api.post("/auth/login", null, {
      params: { email, password },
    });
    localStorage.setItem("token", res.data.access_token);
    return true;
  } catch {
    alert("Login failed");
    return false;
  }
}
