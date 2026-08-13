import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function TopicPage() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState<any>(null);
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);
  const [childTopics, setChildTopics] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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

        // Walk up the parent chain to build a breadcrumb
        const crumbs: any[] = [];
        let current = topicData;
        while (current?.parent_topic) {
          const { data: parentData } = await supabase
            .from("Topics")
            .select("*")
            .eq("name", current.parent_topic)
            .eq("system", current.system)
            .maybeSingle();
          if (parentData) {
            crumbs.unshift(parentData);
            current = parentData;
          } else {
            break;
          }
        }
        setBreadcrumb(crumbs);

        const [childResult, diseaseResult] = await Promise.all([
          supabase.from("Topics").select("*").eq("parent_topic", topicData.name).eq("system", topicData.system),
          supabase.from("Diseases").select("*").eq("topic", topicData.name),
        ]);

        setChildTopics(childResult.data ?? []);
        setDiseases(diseaseResult.data ?? []);
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [topicId]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading...</p>;
  if (!topic) return <p className="page">Topic not found.</p>;

  return (
    <div className="page" style={topic.color ? { background: `var(--color-${topic.color}-light)` } : undefined}>
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {topic.system}{breadcrumb.map((b) => " · " + b.name).join("")}
        </span>
        <h1>{topic.name}</h1>
        <p>Choose a subtopic or disease to keep exploring.</p>
      </div>

      {childTopics.length > 0 && (
        <>
          <h2 style={{ margin: "24px 0 12px" }}>Subtopics</h2>
          <div className="grid">
            {childTopics.map((t) => (
              <Link key={t.id} to={"/topic/" + t.id} className="card" style={{ textDecoration: "none" }}>
                <div className="card-header-band" style={{ background: t.color ? `var(--color-${t.color})` : "var(--color-primary)" }}>
                  <h2>{t.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {diseases.length > 0 && (
        <>
          <h2 style={{ margin: "24px 0 12px" }}>Diseases</h2>
          <div className="grid">
            {diseases.map((d) => (
              <Link key={d.id} to={"/disease/" + d.id} className="card" style={{ textDecoration: "none" }}>
                <div className="card-header-band" style={{ background: d.color ? `var(--color-${d.color})` : "var(--color-primary)" }}>
                  <h2>{d.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {childTopics.length === 0 && diseases.length === 0 && (
        <p className="text-secondary">Nothing added under {topic.name} yet.</p>
      )}
    </div>
  );
}

export default TopicPage;