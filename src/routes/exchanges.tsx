import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/exchanges")({
  component: () => <Navigate to="/refund-policy" replace />,
});
