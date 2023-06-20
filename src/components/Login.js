/* global google */
import React, { useContext, useEffect, useState } from "react"; // import useContext
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext"; // import UserContext
import logo from "./img/TestGenieLogo.png";
import "./Login.css";
import jwt_decode from "jwt-decode";

const Login = () => {
  const { user, setUser } = useContext(UserContext); // use UserContext
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // New state for error message

  useEffect(() => {
    const handleCallbackResponse = (response) => {
      console.log("Encoded JW Token: " + response.credential);
      var userObject = jwt_decode(response.credential);
      console.log(userObject);
      if (userObject.picture) {
        localStorage.setItem("profilePicture", userObject.picture);
      }
      console.log("User Picture: " + userObject.picture);
      console.log("User Pic 2: " + localStorage.getItem("profilePicture"));
      setUser(userObject);
      navigate("/landing");
    };

    // Function to initialize Google One Tap
    const initializeGoogleOneTap = () => {
      google.accounts.id.initialize({
        client_id:
          "689676700162-4lbq8u3nhldbussef4c7gk8iojorvsk0.apps.googleusercontent.com",
        callback: handleCallbackResponse,
      });
      google.accounts.id.renderButton(document.getElementById("signInDiv"), {
        theme: "outline",
        size: "large",
      });
    };

    // Check if Google One Tap has already loaded
    if (window.google && window.google.accounts && window.google.accounts.id) {
      initializeGoogleOneTap();
    } else {
      // If not, retry after a delay
      const timerId = setTimeout(initializeGoogleOneTap, 1000);
      // Clean up timer upon unmount
      return () => clearTimeout(timerId);
    }
  }, [navigate, setUser]); // add setUser as a dependency

  const users = {
    "dcblanton78@gmail.com": "abc123",
    "pierce.blanton3@gmail.com": "abc123",
  };

  const handleEmailPasswordLogin = (e) => {
    e.preventDefault();

    if (users[email] && users[email] === password) {
      console.log("Login successful");
      setUser({ name: email }); // set user to an object with a name property
      navigate("/landing");
    } else {
      console.log("Login failed");
      setErrorMsg("Incorrect email or password. Please try again."); // Set the error message upon failed login
    }
  };

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <div className="Login" data-cy="login-page">
      <div className="landing-page-container">
        <div className="logo-container">
          <img src={logo} alt="TestGenie Logo" className="logo" />
        </div>
      </div>
      <h1 data-cy="login-title">TestGenie!</h1>
      <form onSubmit={handleEmailPasswordLogin} data-cy="login-form">
        <div className="input-container">
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-cy="email-input"
          />
        </div>
        <div className="input-container">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-cy="password-input"
          />
        </div>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <input
          className="login-button"
          type="submit"
          value="Login"
          data-cy="submit-button"
        />
      </form>

      <div id="signInDiv"></div>
      {user && user.name && (
        <div>
          <h3 data-cy="user-name">{user.name}</h3>
          <button onClick={logout} data-cy="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
