import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

  function isActive(path: string) {
    return location.pathname === path ? "nav-item active" : "nav-item";
  }

  return (
    <div className="nav-bar">
      <Link to="/" className="nav-brand">Examineline</Link>
      <div className="nav-links">
        <Link to="/" className={isActive("/")}>Home</Link>
        <Link to="/search" className={isActive("/search")}>Search</Link>
        <Link to="/bookmarks" className={isActive("/bookmarks")}>Bookmarks</Link>
        <Link to="/lectures" className={isActive("/lectures")}>Lectures</Link>
      </div>
    </div>
  );
}

export default NavBar;