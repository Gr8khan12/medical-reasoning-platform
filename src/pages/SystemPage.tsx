import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function SystemPage() {
  const { systemName } = useParams();
  const [diseases, setDiseases] = useState<any[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [systemResult, diseaseResult] = await Promise.all([
          supabase.from("Systems").select("*").eq("name", systemName).maybeSingle(),
          supabase.from("Diseases").select("*").eq("system", systemName),
        ]);

        if (systemResult.data?.color) {
          setColor(systemResult.data.color);
        }

        if (diseaseResult.error) {
          setErrorMsg(diseaseResult.error.message);
        } else {
          setDiseases(diseaseResult.data ?? []);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [systemName]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading diseases...</p>;

  return (
    <div className="page" style={color ? { background: `var(--color-${color}-light)` } : undefined}>
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          Body System
        </span>
        <h1>{systemName}</h1>
        <p>Choose a topic to start exploring concepts and testing your knowledge.</p>
      </div>

      {diseases.length === 0 ? (
        <p className="text-secondary">No diseases found for {systemName}.</p>
      ) : (
        <>
          <div className="grid">
            {diseases.map((d) => (
              <Link
                key={d.id}
                to={"/" + systemName + "/" + d.name}
                className="card"
                style={{ textDecoration: "none" }}
              >
                <div
                   className="card-header-band"
                  style={{ background: d.color ? `var(--color-${d.color})` : "var(--color-primary)" }}
                >
                  <h2>{d.name}</h2>
                </div>
                <p className="text-secondary">Tap to explore concepts and questions</p>
              </Link>
            ))}
          </div>

          <Link
            to={"/" + systemName + "/" + diseases[0].name + "/question?system=" + systemName}
            className={"btn " + (color ? "btn-" + color : "btn-primary")}
            style={{ marginTop: "16px", display: "inline-block" }}
          >
            Test Yourself on All of {systemName}
          </Link>
        </>
      )}
    </div>
  );
}

export default SystemPage;