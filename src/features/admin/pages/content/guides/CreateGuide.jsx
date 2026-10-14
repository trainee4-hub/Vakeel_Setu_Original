import { useNavigate } from "react-router-dom";
import GuideForm from "@features/admin/components/forms/GuideForm";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";

export default function CreateGuide() {
  const navigate = useNavigate();
  return <GuideForm mode="create" onSaved={(saved) => navigate(ADMIN_PATHS.guides.list, { state: { created: saved ?? null } })} />;
}
