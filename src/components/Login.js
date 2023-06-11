import React, { useState } from "react";
import GoogleLogin from "react-google-login";
import { useNavigate } from "react-router-dom";
import logo from "./img/TestGenieLogo.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const users = {
    "dcblanton78@gmail.com": "abc123",
    "pierce.blanton3@gmail.com": "abc123",
  };

  const responseGoogle = (response) => {
    console.log(response);
    if (response.profileObj) {
      console.log("Login successful");
      navigate("/landing");
    }
  };

  const handleEmailPasswordLogin = (e) => {
    e.preventDefault();

    if (users[email] && users[email] === password) {
      console.log("Login successful");
      navigate("/landing");
    } else {
      console.log("Login failed");
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
      <div className="button-container">
        <GoogleLogin
          clientId="689676700162-4lbq8u3nhldbussef4c7gk8iojorvsk0.apps.googleusercontent.com"
          buttonText="Login with Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />
      </div>
    </div>
  );
};

export default Login;
