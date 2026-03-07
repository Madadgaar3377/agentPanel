import React from "react";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";

/**
 * Wraps protected routes with sidebar layout. Use for all agent panel pages.
 */
function AgentLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default AgentLayout;
