import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function ConceptDetail() {
  const { name } = useParams();
  const [concept, setConcept] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [systemName, setSystemName] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string | null>(null);
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

        const { data: childData } = await supabase
          .from("Concepts")
          .select("*")
          .eq("parent_concept", name);
        setChildren(childData ?? []);

        const { data: lectureData } = await supabase
          .from("Lectures")
          .select("*")
          .eq("concept", name);
        setLectures(lectureData ?? []);

        if (data.disease) {
          const { data: diseaseData } = await supabase
            .from("Diseases")
            .select("system, topic")
            .eq("name", data.disease)
            .maybeSingle();

          if (diseaseData?.system) {
            setSystemName(diseaseData.system);
          }
          if (diseaseData?.topic) {
            setTopicName(diseaseData.topic);
          }
        }

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
    <div>
      <div className="hero" style={{ borderRadius: 0 }}>
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {concept.category} {concept.difficulty ? "· " + concept.difficulty : ""}
        </span>
        <h1>{concept.name}</h1>
        {concept.overview && <p>{concept.overview}</p>}
      </div>

      <div className="learn-layout">
        <div className="learn-main">
          {concept.key_points && (
            <>
              <h2>Key Points</h2>
              {concept.key_points.split("|||").map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </>
          )}

          {concept.clinical_relevance && (
            <>
              <h2>Clinical Relevance</h2>
              {concept.clinical_relevance.split("|||").map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </>
          )}

          {!concept.key_points && !concept.clinical_relevance && (
            <p className="text-secondary">No detailed learning content has been added for this concept yet.</p>
          )}

          {lectures.length > 0 && (
            <>
              <h2>Related Lectures</h2>
              {lectures.map((l) => (
                <Link
                  key={l.id}
                  to={"/lectures/" + l.id}
                  className="card"
                  style={{ display: "block", marginBottom: "12px", textDecoration: "none" }}
                >
                  <h3 style={{ marginBottom: "4px" }}>{l.title}</h3>
                  {l.author && <p className="text-secondary">By {l.author}</p>}
                </Link>
              ))}
            </>
          )}

          {systemName && topicName && concept.disease && (
            <Link
              to={"/" + systemName + "/" + topicName + "/" + concept.disease + "/question?concept=" + concept.name}
              className="btn btn-coral"
              style={{ marginTop: "16px", display: "inline-block" }}
            >
              Test yourself on this topic →
            </Link>
          )}
        </div>

        <div className="learn-sidebar">
          <div className="card">
            <h3>Progress</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="btn btn-teal" onClick={() => markProgress("completed")}>Mark as Completed</button>
              <button className="btn btn-amber" onClick={() => markProgress("needs_review")}>Mark as Needs Review</button>
              <button className={bookmarked ? "btn btn-violet" : "btn btn-secondary"} onClick={toggleBookmark}>
                {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
              </button>
            </div>
            {statusMsg && <p className="text-secondary" style={{ marginTop: "8px" }}>{statusMsg}</p>}
          </div>

          {tagList.length > 0 && (
            <div className="card">
              <h3>Tags</h3>
              {tagList.map((t: string) => (
                <span key={t} className="badge badge-violet" style={{ marginRight: "6px", marginBottom: "6px" }}>{t}</span>
              ))}
            </div>
          )}

          {concept.parent_concept && (
            <div className="card">
              <h3>Prerequisite</h3>
              <Link to={"/concepts/" + concept.parent_concept} className="card card-amber" style={{ display: "block" }}>
                {concept.parent_concept}
              </Link>
            </div>
          )}

          {children.length > 0 && (
            <div className="card">
              <h3>Builds Into</h3>
              {children.map((c) => (
                <Link key={c.id} to={"/concepts/" + c.name} className="card card-teal" style={{ display: "block", marginBottom: "8px" }}>
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {relatedList.length > 0 && (
            <div className="card">
              <h3>Related Concepts</h3>
              {relatedList.map((r: string) => (
                <Link key={r} to={"/concepts/" + r} className="card card-violet" style={{ display: "block", marginBottom: "8px" }}>
                  {r}
                </Link>
              ))}
            </div>
          )}

          <Link to="/concepts" className="btn btn-secondary">← Back to all concepts</Link>
        </div>
      </div>
    </div>
  );
}

export default ConceptDetail;