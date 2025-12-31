import React from "react";

import Button from "@/components/Button.js";
interface LoginFormProps {
  setIsRegister: (isRegister: boolean) => void;
}
const LoginForm: React.FC<LoginFormProps> = ({ setIsRegister }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  async function submitForm() {
    const success = await tryRegister(username, email, password);
    if (success) navigate("/profile");
  }
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
      <Button type="submit" className="mb-2 bg-blue-400 px-4 py-2 text-lg hover:bg-blue-500">
        Login
      </Button>
      <Button
        onClick={() => setIsRegister(true)}
        className="bg-transparent text-blue-400 underline hover:bg-transparent"
      >
        Create an account
      </Button>
    </form>
  );
};
export default LoginForm;
