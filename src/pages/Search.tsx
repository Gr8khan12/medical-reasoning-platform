import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Search() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;

    setLoading(true);
    setSearched(true);

    const { data } = await supabase
      .from("Concepts")
      .select("*")
      .ilike("name", "%" + term + "%");

    setResults(data ?? []);
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>Search Concepts</h1>
        <p>Find any concept across every system and disease.</p>
      </div>

      <form onSubmit={runSearch} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          className="input"
          placeholder="Search for a concept..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading && <p className="text-secondary">Searching...</p>}

      {searched && !loading && results.length === 0 && (
        <p className="text-secondary">No concepts found for "{term}".</p>
      )}

      {results.length > 0 && (
        <div className="grid">
          {results.map((c) => (
            <Link key={c.id} to={"/concepts/" + c.name} className="card">
              <h2>{c.name}</h2>
              <p className="text-secondary">{c.description}</p>
              {c.disease && <span className="badge badge-primary">{c.disease}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;