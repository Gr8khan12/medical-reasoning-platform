import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Account created! Check your email to confirm before logging in.");
    }
  }

  return (
    <div className="page" style={{ maxWidth: "420px" }}>
      <div className="hero">
        <h1>Sign Up</h1>
        <p>Create your Examineline account.</p>
      </div>

      <form onSubmit={handleSignUp} className="card">
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
          minLength={6}
        />
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Sign Up
        </button>

        {message && <p className="text-secondary" style={{ marginTop: "12px" }}>{message}</p>}
        {errorMsg && <p style={{ color: "var(--color-danger)", marginTop: "12px" }}>{errorMsg}</p>}

        <p className="text-secondary" style={{ marginTop: "16px" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;