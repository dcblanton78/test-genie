/* global google */
import { React, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
      {user && user.name && (
        <div className="user-info">
          <img src={profilePicture} alt={user.name} />
          <h3>{user.name}</h3>
          <button className="navbar-link" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
