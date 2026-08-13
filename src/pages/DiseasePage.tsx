import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function DiseasePage() {
  const { diseaseId } = useParams();
  const [disease, setDisease] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDisease() {
      try {
        const { data, error } = await supabase
          .from("Diseases")
          .select("*")
          .eq("id", diseaseId)
          .single();

        if (error) {
          setErrorMsg(error.message);
        } else {
          setDisease(data);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDisease();
  }, [diseaseId]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading disease...</p>;
  if (!disease) return <p className="page">Disease not found.</p>;

  return (
    <div className="page" style={disease.color ? { background: `var(--color-${disease.color}-light)` } : undefined}>
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {disease.system} · {disease.topic}
        </span>
        <h1>{disease.name}</h1>
        <p>Explore the key concepts behind {disease.name}, then test what you've learned.</p>
      </div>

      <div className="grid">
        <Link to={"/concepts?disease=" + disease.name} className="card card-teal">
          <h2>Explore Concepts</h2>
          <p className="text-secondary">Browse the topics and see how they connect</p>
        </Link>

        <Link to={"/disease/" + disease.id + "/question?disease=" + disease.name} className="card card-coral">
          <h2>Start Question</h2>
          <p className="text-secondary">Test your knowledge with a quick question</p>
        </Link>
      </div>
    </div>
  );
}

export default DiseasePage;