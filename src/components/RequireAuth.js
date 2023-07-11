// components/RequireAuth.js
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect } from "react";

export default function RequireAuth({ children }) {
  let auth = useAuth();
  let navigate = useNavigate();
  let location = useLocation();

  useEffect(() => {
    if (!auth.user || !auth.user.name) {
      navigate("/", { replace: true, state: { from: location } });
    }
  }, [auth, navigate, location]);

  if (!auth.user || !auth.user.name) {
    return null;
  }

  return children;
}
