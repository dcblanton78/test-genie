/* global google */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext";
import logo from "./img/TestGenieLogo.png";
import "./Login.css";
import jwt_decode from "jwt-decode";

const fetchGoogleUserProfile = async (accessToken) => {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  return data;
};

const isTokenExpired = (token) => {
  const decodedToken = jwt_decode(token);
  const currentTime = Date.now() / 1000;

  return currentTime > decodedToken.exp;
};

const Login = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallbackResponse = async (response) => {
      const accessToken = response.credential;
      console.log("Access Token: ", accessToken);

      if (isTokenExpired(accessToken)) {
        console.error("Access token is expired!");
        // Here you can add logic to refresh the token
      } else {
        const userObject = jwt_decode(accessToken);
        localStorage.setItem("profilePicture", userObject.picture);

        setUser(userObject);
        navigate("/landing");
      }
    };

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

    if (window.google && window.google.accounts && window.google.accounts.id) {
      initializeGoogleOneTap();
    } else {
      const timerId = setTimeout(initializeGoogleOneTap, 1000);
      return () => clearTimeout(timerId);
    }
  }, [navigate, setUser]);

  const users = {
    "dcblanton78@gmail.com": "abc123",
    "pierce.blanton3@gmail.com": "abc123",
    "njgrout@gmail.com": "abc123",
  };

  const handleEmailPasswordLogin = (e) => {
    e.preventDefault();

    if (users[email] && users[email] === password) {
      setUser({ name: email });
      navigate("/landing");
    } else {
      setErrorMsg("Incorrect email or password. Please try again.");
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
