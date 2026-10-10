import AppRoutes from "./routes/AppRoutes";

/**
 * Root component. All page rendering is delegated to the route table so
 * App stays a thin, stable entry point.
 */
export default function App() {
  return <AppRoutes />;
}
