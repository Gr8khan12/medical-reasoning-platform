import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAllConceptDataUnderTopic } from "../lib/topicTree";

function TopicOverview() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState<any>(null);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const { data: topicData, error } = await supabase
          .from("Topics")
          .select("*")
          .eq("id", topicId)
          .single();

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        setTopic(topicData);

        const conceptData = await getAllConceptDataUnderTopic(topicData.name, topicData.system);
        setConcepts(conceptData);
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [topicId]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading overview...</p>;
  if (!topic) return <p className="page">Topic not found.</p>;

  return (
    <div>
      <div className="hero" style={{ borderRadius: 0 }}>
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {topic.system}
        </span>
        <h1>{topic.name} — Full Overview</h1>
        <p>Everything under {topic.name}, in one read.</p>
      </div>

      <div className="learn-layout">
        <div className="learn-main" style={{ textAlign: "center" }}>
          {concepts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-title">Nothing to read yet</p>
              <p className="empty-state-text">No concepts with content exist under {topic.name} yet.</p>
            </div>
          ) : (
            concepts.map((c) => (
              <div key={c.id} style={{ marginBottom: "32px" }}>
                <h2>{c.name}</h2>
                {c.quick_summary ? (
                    <p>{c.quick_summary}</p>
                ) : c.overview ? (
                    <p>{c.overview}</p>
                ) : (
                    <p className="text-secondary">No summary written for this concept yet.</p>
                )}
                <Link to={"/concepts/" + c.name} className="text-secondary" style={{ fontSize: "13px" }}>
                    Read full details →
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="learn-sidebar">
          <Link to={"/topic/" + topicId} className="btn btn-secondary">← Back to {topic.name}</Link>
        </div>
      </div>
    </div>
  );
}

export default TopicOverview;