import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="page" style={{ maxWidth: "420px" }}>
      <div className="hero">
        <h1>Log In</h1>
        <p>Welcome back to Examineline.</p>
      </div>

      <form onSubmit={handleLogin} className="card">
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Log In
        </button>

        {errorMsg && <p style={{ color: "var(--color-danger)", marginTop: "12px" }}>{errorMsg}</p>}

        <p className="text-secondary" style={{ marginTop: "16px" }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;