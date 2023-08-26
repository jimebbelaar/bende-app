import { useState } from "react";
import { Input, Button, message } from "antd";
import { supabase } from "./supabaseConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      message.error("Oepsie..: " + error.message);
    } else {
      message.success("Daar gaat ie dan.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input.Password
          style={{ marginTop: "0.5rem" }}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="primary"
          style={{ marginTop: "1rem" }}
          onClick={handleLogin}
        >
          Avontuur starten
        </Button>
      </div>
    </div>
  );
}

export default Login; // Make sure to export the component
