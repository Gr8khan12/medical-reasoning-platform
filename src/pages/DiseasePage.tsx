import { useParams, Link } from "react-router-dom";

function DiseasePage() {
  const { systemName, diseaseName } = useParams();

  return (
    <div className="page">
      <div className="hero">
        <span className="badge badge-primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {systemName}
        </span>
        <h1>{diseaseName}</h1>
        <p>Explore the key concepts behind {diseaseName}, then test what you've learned.</p>
      </div>

      <div className="grid">
        <Link to={"/concepts?disease=" + diseaseName} className="card card-teal">
          <h2>Explore Concepts</h2>
          <p className="text-secondary">Browse the topics and see how they connect</p>
        </Link>

        <Link to={"/" + systemName + "/" + diseaseName + "/question?disease=" + diseaseName} className="card card-coral">
          <h2>Start Question</h2>
          <p className="text-secondary">Test your knowledge with a quick question</p>
        </Link>
      </div>
    </div>
  );
}

export default DiseasePage;