import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Home() {
  const [systems, setSystems] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystems() {
      try {
        const { data, error } = await supabase.from("Systems").select("*");
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSystems(data ?? []);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSystems();
  }, []);

  return (
    <div className="page">
      <div className="hero">
        <h1>Examineline</h1>
        <p>Welcome to the home page.</p>
      </div>

      {errorMsg && <p className="page">Error: {errorMsg}</p>}
      {loading && <p className="text-secondary">Loading systems...</p>}

      {!loading && !errorMsg && (
        <div className="grid">
          {systems.map((s) => (
            <Link key={s.id} to={"/" + s.name} className="card" style={{ textDecoration: "none" }}>
              <div
                className="card-header-band"
                style={{ background: s.color ? `var(--color-${s.color})` : "var(--color-primary)" }}
              >
                <h2>{s.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <Link to="/question" className="btn btn-coral">
          Test Yourself on Everything
        </Link>
      </div>
    </div>
  );
}

export default Home;