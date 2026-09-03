import { createBrowserRouter, Navigate } from "react-router";
import Shell from "../components/layout/Shell";
import RequireAuth from "../components/layout/RequireAuth";
import Login from "../pages/Login";
import Home from "../pages/Home";
import MyDecks from "../pages/MyDecks";
import DeckCreator from "../pages/DeckCreator";
import ActivityPlayer from "../pages/ActivityPlayer";
import Settings from "../pages/Settings";
import ComingSoon from "../pages/ComingSoon";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center">
      <p className="text-6xl mb-4">🗺️</p>
      <h2 className="font-display font-bold text-2xl text-[#1C1B29] mb-2">Page not found</h2>
      <p className="text-[#6B6B80]">This page doesn't exist yet.</p>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    { path: "/login", Component: Login },
    {
      path: "/",
      element: (
        <RequireAuth>
          <Shell />
        </RequireAuth>
      ),
      children: [
        { index: true, Component: Home },
        {
          path: "explore",
          element: <ComingSoon icon="🔍" title="Explore is coming soon" description="Soon you'll be able to browse and use activities published by other therapists here." />,
        },
        {
          path: "activity/:id",
          element: <Navigate to="/my-decks" replace />,
        },
        { path: "my-decks", Component: MyDecks },
        {
          path: "students",
          element: <ComingSoon icon="👥" title="Student tracking is coming soon" description="Soon you'll be able to manage students, assign activities, and track their goals here." />,
        },
        {
          path: "students/:id",
          element: <ComingSoon icon="👥" title="Student profiles are coming soon" description="Detailed student profiles will live here." />,
        },
        {
          path: "progress",
          element: <ComingSoon icon="📈" title="Progress tracking is coming soon" description="Session history, accuracy trends, and goal progress will show up here." />,
        },
        {
          path: "creator/:id",
          element: <ComingSoon icon="👤" title="Creator profiles are coming soon" description="Public creator profiles will appear here once publishing is available." />,
        },
        { path: "settings", Component: Settings },
        { path: "*", Component: NotFound },
      ],
    },
    // Full-screen routes (also require auth)
    {
      path: "/create",
      element: (
        <RequireAuth>
          <DeckCreator />
        </RequireAuth>
      ),
    },
    {
      path: "/play/:id",
      element: (
        <RequireAuth>
          <ActivityPlayer />
        </RequireAuth>
      ),
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
