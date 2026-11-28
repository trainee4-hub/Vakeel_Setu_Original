import { useAuth } from "../../auth";
import LegalAssistant from "../components/LegalAssistant";

const LegalAssistantPage = () => {
  const { user } = useAuth();

  return (
    <div className="h-full w-full overflow-hidden">
      <LegalAssistant user={user} />
    </div>
  );
};

export default LegalAssistantPage;
