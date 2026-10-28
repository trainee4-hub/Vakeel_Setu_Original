import "./App.css";

import { AuthInitializer } from "../features/auth";
import AppLayout from "./layouts/AppLayout";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <AuthInitializer />

      <AppLayout />
    </>
  );
}

export default App;