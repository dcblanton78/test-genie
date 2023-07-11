// hooks/useAuth.js
import { useContext } from "react";
import UserContext from "../components/UserContext";

export default function useAuth() {
  return useContext(UserContext);
}
