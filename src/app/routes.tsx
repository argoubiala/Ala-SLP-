import { createBrowserRouter } from "react-router";
import Shell from "../components/layout/Shell";
import RequireAuth from "../components/layout/RequireAuth";
import Login from "../pages/Login";
import Home from "../pages/Home";
import MyDecks from "../pages/MyDecks";
import DeckCreator from "../pages/DeckCreator";
import ActivityPlayer from "../pages/ActivityPlayer";
import Settings from "../pages/Settings";
import Explore from "../pages/Explore";
import ActivityDetail from "../pages/ActivityDetail";
import CreatorProfile from "../pages/CreatorProfile";
import Students from "../pages/Students";
import StudentProfile from "../pages/StudentProfile";
import Progress from "../pages/Progress";
import AdminAssetManager from "../pages/AdminAssetManager";
import AdminGate from "../components/layout/AdminGate";

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
        { path: "explore", Component: Explore },
        { path: "activity/:id", Component: ActivityDetail },
        { path: "my-decks", Component: MyDecks },
        { path: "students", Component: Students },
        { path: "students/:id", Component: StudentProfile },
        { path: "progress", Component: Progress },
        { path: "creator/:id", Component: CreatorProfile },
        { path: "settings", Component: Settings },
        {
          path: "admin/assets",
          element: (
            <AdminGate>
              <AdminAssetManager />
            </AdminGate>
          ),
        },
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
