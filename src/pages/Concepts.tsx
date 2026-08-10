import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Concepts() {
  const [searchParams] = useSearchParams();
  const disease = searchParams.get("disease");

  const [concepts, setConcepts] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase.from("Concepts").select("*");
        if (disease) {
          query = query.eq("disease", disease);
        }

        const [conceptsResult, progressResult] = await Promise.all([
          query,
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

        if (disease) {
          const { data: diseaseRow } = await supabase
            .from("Diseases")
            .select("color")
            .eq("name", disease)
            .maybeSingle();

          if (diseaseRow?.color) {
            setColor(diseaseRow.color);
          }
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [disease]);

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
    <div className="page" style={color ? { background: `var(--color-${color}-light)` } : undefined}>
      <div className="hero">
        <h1>{disease ? disease + " Concepts" : "Concepts"}</h1>
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