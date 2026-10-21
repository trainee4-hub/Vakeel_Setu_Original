import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

import Navbar from "@app/layouts/Navbar";
import FindLawyer from "../components/FindLawyer/FindLawyer";

const FindLawyerPage = () => {
  const navigate = useNavigate();

  const { isLoggedIn, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased">
      <Navbar
        activePage="findLawyer"
        isLoggedIn={isLoggedIn}
        user={user}
        onLogoClick={() => navigate("/")}
        onIpcWikiClick={() => navigate("/legal-assistant")}
        onLoginClick={() => navigate("/login")}
        onSignupClick={() => navigate("/signup")}
        onDashboardClick={() => navigate("/")}
      />

      <main className="pb-20 min-h-screen">
        <FindLawyer
          onViewAdvocate={(id, options = {}) => {
            navigate(`/find-lawyer/${id}`, {
              state: options,
            });
          }}
        />
      </main>
    </div>
  );
};

export default FindLawyerPage;