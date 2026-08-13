import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function SystemPage() {
  const { systemName } = useParams();
  const [topics, setTopics] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const { data, error } = await supabase
          .from("Topics")
          .select("*")
          .eq("system", systemName)
          .is("parent_topic", null);

        if (error) {
          setErrorMsg(error.message);
        } else {
          setTopics(data ?? []);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, [systemName]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading topics...</p>;

  return (
    <div className="page">
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          Body System
        </span>
        <h1>{systemName}</h1>
        <p>Choose a topic to start exploring diseases and concepts.</p>
      </div>

      {topics.length === 0 ? (
        <p className="text-secondary">No topics found for {systemName}.</p>
      ) : (
        <div className="grid">
          {topics.map((t) => (
            <Link
              key={t.id}
              to={"/topic/" + t.id}
              className="card"
              style={{ textDecoration: "none" }}
            >
              <div
                className="card-header-band"
                style={{ background: t.color ? `var(--color-${t.color})` : "var(--color-primary)" }}
              >
                <h2>{t.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      {topics.length > 0 && (
        <Link
          to={"/" + systemName + "/question?system=" + systemName}
          className="btn btn-primary"
          style={{ marginTop: "16px", display: "inline-block" }}
        >
          Test Yourself on All of {systemName}
        </Link>
      )}
    </div>
  );
}

export default SystemPage;