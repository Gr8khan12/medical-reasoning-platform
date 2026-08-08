import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Question() {
  const [searchParams] = useSearchParams();
  const concept = searchParams.get("concept");

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        let query = supabase.from("Questions").select("*");
        if (concept) {
          query = query.eq("concept", concept);
        }
        const { data, error } = await query;

        if (error) {
          setErrorMsg(error.message);
        } else {
          setQuestions(data ?? []);
        }
      } catch (err: any) {
        setErrorMsg("Caught exception: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [concept]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading questions...</p>;
  if (questions.length === 0) {
    return (
      <div className="page">
        <p className="text-secondary">No questions found{concept ? " for " + concept : ""}.</p>
        <Link to="/concepts" className="btn btn-secondary">Back to Concepts</Link>
      </div>
    );
  }

  const q = questions[currentIndex];
  const options = q.options ? q.options.split(",").map((s: string) => s.trim()) : [];

  function getOptionClass(option: string) {
    if (!selected) return "answer-option";
    if (option === q.answer) return "answer-option correct";
    if (option === selected) return "answer-option incorrect";
    return "answer-option";
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
    }
  }

  return (
    <div className="page">
      <h1>Questions{concept ? ": " + concept : ""}</h1>

      <div className="card">
        <p className="quiz-progress-label">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <p className="quiz-question">{q.question}</p>

        <div className="answer-grid">
          {options.map((opt: string) => (
            <button
              key={opt}
              className={getOptionClass(opt)}
              onClick={() => setSelected(opt)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          ))}
        </div>

        {selected && (
          <p className="text-secondary" style={{ marginTop: "12px" }}>{q.explanation}</p>
        )}

        {selected && currentIndex < questions.length - 1 && (
          <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={nextQuestion}>
            Next Question
          </button>
        )}
      </div>

      <Link to="/concepts" className="btn btn-secondary" style={{ marginTop: "16px" }}>Back to Concepts</Link>
    </div>
  );
}

export default Question;