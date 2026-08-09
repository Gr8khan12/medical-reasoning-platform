import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function ConceptDetail() {
  const { name } = useParams();
  const [concept, setConcept] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [systemName, setSystemName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

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
          setLoading(false);
          return;
        }

        setConcept(data);

        // Reverse lookup: find children (rows whose parent_concept is this concept's name)
        const { data: childData } = await supabase
          .from("Concepts")
          .select("*")
          .eq("parent_concept", name);

        setChildren(childData ?? []);

        // Look up the system this concept's disease belongs to (for the quiz link)
        if (data.disease) {
          const { data: diseaseData } = await supabase
            .from("Diseases")
            .select("system")
            .eq("name", data.disease)
            .maybeSingle();

          if (diseaseData?.system) {
            setSystemName(diseaseData.system);
          }
        }

        // Load existing bookmark state
        const { data: progressData } = await supabase
          .from("Progress")
          .select("bookmarked")
          .eq("concept_name", name)
          .maybeSingle();

        if (progressData?.bookmarked) {
          setBookmarked(true);
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

  async function toggleBookmark() {
    const newValue = !bookmarked;
    setBookmarked(newValue);

    const { error } = await supabase.from("Progress").upsert(
      { concept_name: name, bookmarked: newValue },
      { onConflict: "concept_name" }
    );

    if (error) {
      setStatusMsg("Bookmark save failed: " + error.message);
    }
  }

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading concept...</p>;
  if (!concept) return <p className="page">Concept not found.</p>;

  const relatedList = concept.related_concepts
    ? concept.related_concepts.split(",").map((s: string) => s.trim())
    : [];

  const tagList = concept.tags
    ? concept.tags.split(",").map((s: string) => s.trim())
    : [];

  return (
    <div className="page">
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {concept.category} {concept.difficulty ? "· " + concept.difficulty : ""}
        </span>
        <h1>{concept.name}</h1>
        <p>{concept.description}</p>
      </div>

      {tagList.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          {tagList.map((t: string) => (
            <span key={t} className="badge badge-violet" style={{ marginRight: "8px" }}>{t}</span>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: "16px" }}>
        <h2>Track your progress</h2>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px", justifyContent: "center" }}>
          <button className="btn btn-teal" onClick={() => markProgress("completed")}>
            Mark as Completed
          </button>
          <button className="btn btn-amber" onClick={() => markProgress("needs_review")}>
            Mark as Needs Review
          </button>
          <button className={bookmarked ? "btn btn-violet" : "btn btn-secondary"} onClick={toggleBookmark}>
            {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>
        </div>
        {statusMsg && <p className="text-secondary" style={{ marginTop: "12px" }}>{statusMsg}</p>}
      </div>

      {concept.parent_concept && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2>Prerequisite</h2>
          <p className="text-secondary" style={{ marginBottom: "8px" }}>Learn this first:</p>
          <Link to={"/concepts/" + concept.parent_concept} className="card card-amber" style={{ display: "block" }}>
            {concept.parent_concept}
          </Link>
        </div>
      )}

      {children.length > 0 && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2>Builds Into</h2>
          <p className="text-secondary" style={{ marginBottom: "8px" }}>Once you know this, explore:</p>
          <div className="grid">
            {children.map((c) => (
              <Link key={c.id} to={"/concepts/" + c.name} className="card card-teal">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

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
        {systemName && concept.disease && (
          <Link to={"/" + systemName + "/" + concept.disease + "/question?concept=" + concept.name} className="btn btn-coral">
            Test yourself on this topic →
          </Link>
        )}
      </div>
    </div>
  );
}

export default ConceptDetail;