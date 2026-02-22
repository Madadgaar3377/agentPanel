import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { setAuthToken } from "../config/api";

/**
 * Handles login via Bearer token in URL (redirect from main Madadgaar site when user is agent).
 * Calls GET /auth/agentSession with Bearer token, saves session, then redirects to dashboard.
 */
export default function LoginWithToken() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const query = window.location.search || (window.location.hash && window.location.hash.indexOf("?") >= 0 ? window.location.hash.slice(window.location.hash.indexOf("?")) : "");
    const token = searchParams.get("token") || new URLSearchParams(query).get("token");
    const trimmedToken = token && typeof token === "string" ? token.trim() : "";

    if (!trimmedToken) {
      setStatus("error");
      setMessage("No token provided. Please log in from the main site or use the form below.");
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/agentSession`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${trimmedToken}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!mounted) return;

        if (!res.ok || !data.success) {
          setStatus("error");
          setMessage(data?.message || "Invalid or expired token. Please log in again.");
          setSearchParams({});
          return;
        }

        const user = data.user;
        if (!user) {
          setStatus("error");
          setMessage("Could not load session.");
          setSearchParams({});
          return;
        }

        setAuthToken(trimmedToken);
        login(trimmedToken, user);

        setSearchParams({});
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.pathname + (window.location.hash.split("?")[0] || "");
          window.history.replaceState({}, "", cleanUrl || "/login");
        }
        setStatus("success");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        if (!mounted) return;
        console.error("Login with token error:", err);
        setStatus("error");
        setMessage("Network error. Please try again.");
        setSearchParams({});
      }
    })();

    return () => { mounted = false; };
  }, [searchParams, setSearchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-primary/20 p-8 text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">MADADGAAR</h1>
          <p className="text-gray-600">Agent Panel</p>
        </div>

        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Signing you in...</p>
          </>
        )}

        {status === "error" && (
          <div className="mt-4">
            <p className="text-red-600 font-medium mb-4">{message}</p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-95 transition"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}
