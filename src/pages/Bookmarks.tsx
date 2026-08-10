import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Bookmarks() {
  const [concepts, setConcepts] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const { data: progressRows, error: progressError } = await supabase
          .from("Progress")
          .select("concept_name")
          .eq("bookmarked", true);

        if (progressError) {
          setErrorMsg(progressError.message);
          return;
        }

        const names = (progressRows ?? []).map((p) => p.concept_name);

        if (names.length === 0) {
          setConcepts([]);
          return;
        }

        const { data: conceptRows, error: conceptError } = await supabase
          .from("Concepts")
          .select("*")
          .in("name", names);

        if (conceptError) {
          setErrorMsg(conceptError.message);
        } else {
          setConcepts(conceptRows ?? []);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading bookmarks...</p>;

  return (
    <div className="page">
      <div className="hero">
        <h1>Bookmarks</h1>
        <p>Concepts you've saved to come back to.</p>
      </div>

      {concepts.length === 0 ? (
        <p className="text-secondary">You haven't bookmarked anything yet.</p>
      ) : (
        <div className="grid">
          {concepts.map((c) => (
            <Link key={c.id} to={"/concepts/" + c.name} className="card">
              <h2>{c.name}</h2>
              <p className="text-secondary">{c.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookmarks;