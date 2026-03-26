import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../components/pages/Dashboard/Dashboard";
import History from "../components/pages/History/History";
import Login from "../components/pages/Login";
import Register from "../components/pages/Register";
import EmailVerification from "../components/pages/EmailVerification";
import VerifyRequired from "../components/pages/VerifyRequired";
import { ProtectedRoute, PublicRoute, AuthenticatedRoute, VerificationRoute } from "../auth/RouteGuards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <h1>404 Unauthorized</h1>,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "history",
        element: <History />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <VerificationRoute>
        <EmailVerification />
      </VerificationRoute>
    ),
  },
  {
    path: "/verify-required",
    element: (
      <AuthenticatedRoute>
        <VerifyRequired />
      </AuthenticatedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/register" replace />,
  },
]);




