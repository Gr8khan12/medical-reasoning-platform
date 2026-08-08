import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function SystemPage() {
  const { systemName } = useParams();
  const [diseases, setDiseases] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiseases() {
      try {
        const { data, error } = await supabase
          .from("Diseases")
          .select("*")
          .eq("system", systemName);

        if (error) {
          setErrorMsg(error.message);
        } else {
          setDiseases(data ?? []);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDiseases();
  }, [systemName]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading diseases...</p>;

  return (
    <div className="page">
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
        <div className="grid">
          {diseases.map((d) => (
            <Link key={d.id} to={"/" + systemName + "/" + d.name} className="card card-primary">
              <h2>{d.name}</h2>
              <p className="text-secondary">Tap to explore concepts and questions</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SystemPage;