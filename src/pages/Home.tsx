import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <div className="hero">
        <h1>Medical Reasoning Platform</h1>
        <p>Welcome to the home page.</p>
      </div>
      <Link to="/Cardiology" className="btn btn-primary">Go to Cardiology</Link>
    </div>
  );
}

export default Home;