/* global google */
import { React, useContext } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import UserContext from "./UserContext";

const Navbar = (props) => {
  console.log(props);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const profilePicture = localStorage.getItem("profilePicture");

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };

  return (
    <nav className="navbar">
      <NavLink to="/landing" className="navbar-link" activeClassName="active">
        Home
      </NavLink>
      <NavLink
        to="/req-to-test"
        className="navbar-link"
        activeClassName="active"
      >
        ReqToTest
      </NavLink>
      <NavLink
        to="/code-to-test"
        className="navbar-link"
        activeClassName="active"
      >
        CodeToTest
      </NavLink>
      <NavLink
        to="/tag-your-code"
        className="navbar-link"
        activeClassName="active"
      >
        TagYourCode
      </NavLink>
      <NavLink
        to="/barrier-breaker"
        className="navbar-link"
        activeClassName="active"
      >
        BarrierBreaker
      </NavLink>
      <NavLink
        to="/your-tests"
        className="navbar-link"
        activeClassName="active"
      >
        Your Tests
      </NavLink>
      {user && user.name ? (
        <div className="user-info">
          <img
            referrerPolicy="no-referrer"
            src={profilePicture}
            alt={user.name}
          />
          <h3 data-cy="user-name">{user.name}</h3>
          <button
            className="navbar-link"
            onClick={logout}
            data-cy="logout-button"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="user-info">
          <Link to="/" className="navbar-link" data-cy="login-button">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
