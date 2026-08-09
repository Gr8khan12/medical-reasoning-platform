import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <div className="hero">
        <h1>Medical Reasoning Platform</h1>
        <p>Welcome to the home page.</p>
      </div>
      <Link to="/Cardiology" className="btn btn-primary">Go to Cardiology</Link>
      <Link to="/question" className="btn btn-coral" style={{ marginTop: "12px", display: "inline-block" }}>
        Test Yourself on Everything
      </Link>
    </div>
  );
}

export default Home;