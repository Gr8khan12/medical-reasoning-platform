import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAllConceptsUnderTopic } from "../lib/topicTree";

function Question() {
  const [searchParams] = useSearchParams();
  const concept = searchParams.get("concept");
  const disease = searchParams.get("disease");
  const topic = searchParams.get("topic");
  const system = searchParams.get("system");

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [backUrl, setBackUrl] = useState("/concepts");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        let conceptNames: string[] | null = null;

        if (concept) {
          conceptNames = [concept];

          const { data: conceptRow } = await supabase
            .from("Concepts")
            .select("disease")
            .eq("name", concept)
            .maybeSingle();

          if (conceptRow?.disease) {
            setBackUrl("/concepts?disease=" + conceptRow.disease);
          }
        } else if (disease) {
          setBackUrl("/concepts?disease=" + disease);

          const { data: conceptRows } = await supabase
            .from("Concepts")
            .select("name")
            .eq("disease", disease);
          conceptNames = (conceptRows ?? []).map((c) => c.name);
        } else if (topic) {
          const topicSystem = searchParams.get("topicSystem") ?? "";

          const { data: topicRow } = await supabase
            .from("Topics")
            .select("id")
            .eq("name", topic)
            .eq("system", topicSystem)
            .maybeSingle();

          if (topicRow?.id) {
            setBackUrl("/topic/" + topicRow.id);
          }

          conceptNames = await getAllConceptsUnderTopic(topic, topicSystem);
        } else if (system) {
          setBackUrl("/" + system);

          const { data: diseaseRows } = await supabase
            .from("Diseases")
            .select("name")
            .eq("system", system);
          const diseaseNames = (diseaseRows ?? []).map((d) => d.name);

          let viaDiseaseConcepts: string[] = [];
          if (diseaseNames.length > 0) {
            const { data: conceptRows } = await supabase
              .from("Concepts")
              .select("name")
              .in("disease", diseaseNames);
            viaDiseaseConcepts = (conceptRows ?? []).map((c) => c.name);
          }

          const { data: topLevelTopics } = await supabase
            .from("Topics")
            .select("name")
            .eq("system", system)
            .is("parent_topic", null);

          let viaTopicConcepts: string[] = [];
          for (const t of topLevelTopics ?? []) {
            const nested = await getAllConceptsUnderTopic(t.name, system);
            viaTopicConcepts = viaTopicConcepts.concat(nested);
          }

          conceptNames = [...new Set([...viaDiseaseConcepts, ...viaTopicConcepts])];
        }

        let query = supabase.from("Questions").select("*");
        if (conceptNames) {
          query = query.in("concept", conceptNames);
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
  }, [concept, disease, topic, system]);

  if (errorMsg) return <p className="page">Error: {errorMsg}</p>;
  if (loading) return <p className="page">Loading questions...</p>;

  const backLabel = concept || disease ? "Back to Concepts" : topic ? "Back to " + topic : system ? "Back to " + system : "Back to Concepts";

  if (questions.length === 0) {
    return (
      <div className="page">
        <p className="text-secondary">
          No questions found
          {concept ? " for " + concept : disease ? " for " + disease : topic ? " for " + topic : system ? " for " + system : ""}.
        </p>
        <Link to={backUrl} className="btn btn-secondary">{backLabel}</Link>
      </div>
    );
  }

  const q = questions[currentIndex];
  const options = q.options ? q.options.split(",").map((s: string) => s.trim()) : [];
  const wrongExplanations: Record<string, string> = {};
  if (q.wrong_explanations) {
    q.wrong_explanations.split(";").forEach((pair: string) => {
      const [option, explanation] = pair.split(":");
      if (option && explanation) {
        wrongExplanations[option.trim()] = explanation.trim();
      }
    });
  }

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

  async function recordAnswer(isCorrect: boolean) {
    if (!concept) return;

    const { data: existing } = await supabase
      .from("Progress")
      .select("*")
      .eq("concept_name", concept)
      .maybeSingle();

    const questionsAnswered = (existing?.questions_answered ?? 0) + 1;
    const correctCount = (existing?.correct_count ?? 0) + (isCorrect ? 1 : 0);
    const incorrectCount = (existing?.incorrect_count ?? 0) + (isCorrect ? 0 : 1);

    await supabase.from("Progress").upsert(
      {
        concept_name: concept,
        questions_answered: questionsAnswered,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
      },
      { onConflict: "concept_name" }
    );
  }

  return (
    <div className="page">
      <h1>
        Questions
        {concept ? ": " + concept : disease ? ": " + disease : topic ? ": " + topic : system ? ": " + system : ": All Topics"}
      </h1>

      <div className="quiz-card">
        <p className="quiz-progress-label">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: ((currentIndex + 1) / questions.length) * 100 + "%" }}
          />
        </div>
        <p className="quiz-question">{q.question}</p>

        <div className="answer-grid">
          {options.map((opt: string, i: number) => (
            <button
              key={opt}
              className={getOptionClass(opt)}
              onClick={() => {
                setSelected(opt);
                recordAnswer(opt === q.answer);
              }}
              disabled={selected !== null}
            >
              <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ marginTop: "12px" }}>
            {selected === q.answer ? (
              <p className="text-secondary">{q.explanation}</p>
            ) : (
              <>
                <p className="text-secondary">
                  <strong>Why "{selected}" is wrong:</strong>{" "}
                  {wrongExplanations[selected] || "This isn't the correct answer for this question."}
                </p>
                <p className="text-secondary" style={{ marginTop: "8px" }}>
                  <strong>Why "{q.answer}" is correct:</strong> {q.explanation}
                </p>
              </>
            )}
          </div>
        )}

        {selected && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
            {currentIndex < questions.length - 1 && (
              <button className="btn btn-primary" onClick={nextQuestion}>
                Continue
              </button>
            )}

            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
              Retry This Question
            </button>

            {concept && (
              <Link to={"/concepts/" + concept} className="btn btn-teal">
                Review Concept
              </Link>
            )}
          </div>
        )}
      </div>

      <Link to={backUrl} className="btn btn-secondary" style={{ marginTop: "16px" }}>{backLabel}</Link>
    </div>
  );
}

export default Question;