import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Lectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLectures() {
      try {
        const { data, error } = await supabase.from("Lectures").select("*");
        if (error) {
          setErrorMsg(error.message);
        } else {
          setLectures(data ?? []);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLectures();
  }, []);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading lectures...</p>;

  return (
    <div className="page">
      <div className="hero">
        <h1>Lectures</h1>
        <p>In-depth lessons written by your instructors.</p>
      </div>

      {lectures.length === 0 ? (
        <p className="text-secondary">No lectures published yet.</p>
      ) : (
        <div className="grid">
          {lectures.map((l) => (
            <Link key={l.id} to={"/lectures/" + l.id} className="card">
              <span className="badge badge-primary">{l.system}{l.topic ? " · " + l.topic : ""}</span>
              <h2 style={{ marginTop: "12px" }}>{l.title}</h2>
              {l.author && <p className="text-secondary">By {l.author}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Lectures;