import { useNavigate, useParams } from "react-router-dom";

import AdvocateProfile from "../components/AdvocateProfile/AdvocateProfile";
import { useAuth } from "../../auth";

function AdvocateProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased">
      <main className="pb-20 min-h-screen">
        <AdvocateProfile
          advocateId={id}
          onBack={() => navigate("/find-lawyer")}
          onConsultationBooked={(consultationId, type) => {
            if (type === "message") {
              navigate(`/messages`);
            } else {
              navigate("/bookings");
            }
          }}
        />
      </main>
    </div>
  );
}

export default AdvocateProfilePage;
