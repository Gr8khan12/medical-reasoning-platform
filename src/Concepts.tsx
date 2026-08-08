import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

function Concepts() {
  const [concepts, setConcepts] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [conceptsResult, progressResult] = await Promise.all([
          supabase.from("Concepts").select("*"),
          supabase.from("Progress").select("*"),
        ]);

        if (conceptsResult.error) {
          setErrorMsg(conceptsResult.error.message);
        } else {
          setConcepts(conceptsResult.data ?? []);
        }

        if (progressResult.data) {
          setProgress(progressResult.data);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function getStatus(conceptName: string) {
    const match = progress.find((p) => p.concept_name === conceptName);
    return match ? match.status : "not started";
  }

  function getBadgeClass(status: string) {
    if (status === "completed") return "badge badge-teal";
    if (status === "needs_review") return "badge badge-amber";
    return "badge badge-primary";
  }

  function getStatusLabel(status: string) {
    if (status === "completed") return "Completed";
    if (status === "needs_review") return "Needs Review";
    return "Not Started";
  }

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading concepts...</p>;

  return (
    <div className="page">
      <div className="hero">
        <h1>Concepts</h1>
        <p>Browse each concept and see how it connects to the rest of the topic.</p>
      </div>

      <div className="grid">
        {concepts.map((c) => (
          <Link key={c.id} to={"/concepts/" + c.name} className="card">
            <span className={getBadgeClass(getStatus(c.name))}>
              {getStatusLabel(getStatus(c.name))}
            </span>
            <h2 style={{ marginTop: "12px" }}>{c.name}</h2>
            <p className="text-secondary">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Concepts;