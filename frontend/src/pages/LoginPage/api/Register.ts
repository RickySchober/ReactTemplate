import api from "@/api/client.js";

export async function tryRegister(
  username: string,
  email: string,
  password: string
): Promise<boolean> {
  try {
    const res = await api.post("/auth/signup", { username, email, password });
    localStorage.setItem("token", res.data.access_token);
    return true;
  } catch {
    alert("Registration failed");
    return false;
  }
}
