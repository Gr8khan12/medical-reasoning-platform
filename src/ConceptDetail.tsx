import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

function ConceptDetail() {
  const { name } = useParams();
  const [concept, setConcept] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConcept() {
      try {
        const { data, error } = await supabase
          .from("Concepts")
          .select("*")
          .eq("name", name)
          .single();
        if (error) {
          setErrorMsg(error.message);
        } else {
          setConcept(data);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConcept();
  }, [name]);

  async function markProgress(status: string) {
    const { error } = await supabase
      .from("Progress")
      .upsert({ concept_name: name, status: status }, { onConflict: "concept_name" });

    if (error) {
      setStatusMsg("Error saving progress: " + error.message);
    } else {
      setStatusMsg("Marked as: " + status);
    }
  }

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading concept...</p>;
  if (!concept) return <p className="page">Concept not found.</p>;

  const relatedList = concept.related_concepts
    ? concept.related_concepts.split(",").map((s: string) => s.trim())
    : [];

  return (
    <div className="page">
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {concept.category}
        </span>
        <h1>{concept.name}</h1>
        <p>{concept.description}</p>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <h2>Track your progress</h2>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px", justifyContent: "center" }}>
          <button className="btn btn-teal" onClick={() => markProgress("completed")}>
            Mark as Completed
          </button>
          <button className="btn btn-amber" onClick={() => markProgress("needs_review")}>
            Mark as Needs Review
          </button>
        </div>
        {statusMsg && <p className="text-secondary" style={{ marginTop: "12px" }}>{statusMsg}</p>}
      </div>

      {relatedList.length > 0 && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2>Related Concepts</h2>
          <div className="grid" style={{ marginTop: "12px" }}>
            {relatedList.map((r: string) => (
              <Link key={r} to={"/concepts/" + r} className="card card-violet">
                {r}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <Link to="/concepts" className="btn btn-secondary">
          ← Back to all concepts
        </Link>
        <Link to={"/Cardiology/Hyperlipidemia/question?concept=" + concept.name} className="btn btn-coral">
          Test yourself on this topic →
        </Link>
</div>
    </div>
  );
}

export default ConceptDetail;