import "./App.css";

import { AuthInitializer } from "../features/auth";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <>
      <AuthInitializer />

      <AppLayout />
    </>
  );
}

export default App;