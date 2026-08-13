import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function LectureDetail() {
  const { id } = useParams();
  const [lecture, setLecture] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLecture() {
      try {
        const { data, error } = await supabase
          .from("Lectures")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setErrorMsg(error.message);
        } else {
          setLecture(data);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLecture();
  }, [id]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading lecture...</p>;
  if (!lecture) return <p className="page">Lecture not found.</p>;

  return (
    <div>
      <div className="hero" style={{ borderRadius: 0 }}>
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {lecture.system}{lecture.topic ? " · " + lecture.topic : ""}
        </span>
        <h1>{lecture.title}</h1>
        {lecture.author && <p>By {lecture.author}</p>}
      </div>

      <div className="learn-layout">
        <div className="learn-main">
          {lecture.video_url && (
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, marginBottom: "24px" }}>
              <iframe
                src={lecture.video_url.replace("watch?v=", "embed/")}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "12px", border: "none" }}
                allowFullScreen
              />
            </div>
          )}

          {lecture.content ? (
            lecture.content.split("|||").map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))
          ) : (
            <p className="text-secondary">This lecture has no content yet.</p>
          )}
        </div>

        <div className="learn-sidebar">
          <Link to="/lectures" className="btn btn-secondary">← Back to all lectures</Link>
        </div>
      </div>
    </div>
  );
}

export default LectureDetail;