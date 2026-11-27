import { useAuth } from "../../auth";
import IpcWiki from '../components/LegalAssistant';

const IpcWikiPage = () => {
  const { user } = useAuth();

  return (
    <div className="h-full w-full overflow-hidden">
      <IpcWiki user={user} />
    </div>
  );
};

export default IpcWikiPage;