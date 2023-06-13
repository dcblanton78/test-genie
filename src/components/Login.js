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

      <div id="signInDiv"></div>
      {user && user.name && (
        <div>
          <h3>{user.name}</h3>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Login;
