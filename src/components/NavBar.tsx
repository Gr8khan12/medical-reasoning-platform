import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  function isActive(path: string) {
    return location.pathname === path ? "nav-item active" : "nav-item";
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="nav-bar">
      <Link to="/" className="nav-brand">Examineline</Link>
      <div className="nav-links">
        <Link to="/" className={isActive("/")}>Home</Link>
        <Link to="/search" className={isActive("/search")}>Search</Link>
        <Link to="/bookmarks" className={isActive("/bookmarks")}>Bookmarks</Link>
        <Link to="/lectures" className={isActive("/lectures")}>Lectures</Link>

        {session ? (
          <>
            <span className="nav-item text-secondary">{session.user.email}</span>
            <button onClick={handleLogout} className="nav-item" style={{ background: "none", border: "none", cursor: "pointer" }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive("/login")}>Log In</Link>
            <Link to="/signup" className={isActive("/signup")}>Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default NavBar;