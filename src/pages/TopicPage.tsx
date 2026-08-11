import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function TopicPage() {
  const { systemName, topicName } = useParams();
  const [diseases, setDiseases] = useState<any[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [topicResult, diseaseResult] = await Promise.all([
          supabase.from("Topics").select("*").eq("name", topicName).eq("system", systemName).maybeSingle(),
          supabase.from("Diseases").select("*").eq("topic", topicName),
        ]);

        if (topicResult.data?.color) {
          setColor(topicResult.data.color);
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
  }, [systemName, topicName]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading diseases...</p>;

  return (
    <div className="page" style={color ? { background: `var(--color-${color}-light)` } : undefined}>
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {systemName}
        </span>
        <h1>{topicName}</h1>
        <p>Choose a specific disease to explore its concepts and questions.</p>
      </div>

      {diseases.length === 0 ? (
        <p className="text-secondary">No diseases found under {topicName}.</p>
      ) : (
        <>
          <div className="grid">
            {diseases.map((d) => (
              <Link
                key={d.id}
                to={"/" + systemName + "/" + topicName + "/" + d.name}
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
            to={"/" + systemName + "/" + topicName + "/" + diseases[0].name + "/question?topic=" + topicName}
            className={"btn " + (color ? "btn-" + color : "btn-primary")}
            style={{ marginTop: "16px", display: "inline-block" }}
          >
            Test Yourself on All of {topicName}
          </Link>
        </>
      )}
    </div>
  );
}

export default TopicPage;