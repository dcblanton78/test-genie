/* global google */
import React, { useState } from "react";
// import GoogleLogin from "react-google-login";
import { useNavigate } from "react-router-dom";
import logo from "./img/TestGenieLogo.png";
import "./Login.css";
import { useEffect } from "react";
import jwt_decode from "jwt-decode";

const Login = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //global google login
  function handleCallbackResponse(response) {
    console.log("Encoded JW Token: " + response.credential);
    var userObject = jwt_decode(response.credential);
    console.log(userObject);
    setUser(userObject);
    navigate("/landing");
  }

  useEffect(() => {
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
  }, []);

  const users = {
    "dcblanton78@gmail.com": "abc123",
    "pierce.blanton3@gmail.com": "abc123",
  };

  //   const responseGoogle = (response) => {
  //     console.log(response);
  //     if (response.profileObj) {
  //       console.log("Login successful");
  //       navigate("/landing");
  //     }
  //   };

  const handleEmailPasswordLogin = (e) => {
    e.preventDefault();

    if (users[email] && users[email] === password) {
      console.log("Login successful");
      navigate("/landing");
    } else {
      console.log("Login failed");
    }
  };

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <div className="Login">
      <div className="landing-page-container">
        <div className="logo-container">
          <img src={logo} alt="TestGenie Logo" className="logo" />
        </div>
      </div>
      <h1>Login Page</h1>
      <form onSubmit={handleEmailPasswordLogin}>
        <div className="input-container">
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <input className="login-button" type="submit" value="Login" />
      </form>

      {/* If we have no user: show the Google One Tap button
      If we have a user: show the user's name and email */}

      <div id="signInDiv"></div>
      {user && Object.keys(user).length > 0 && (
        <div>
          <img src={user.picture} alt="user"></img>
          <h3>{user.name}</h3>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Login;
