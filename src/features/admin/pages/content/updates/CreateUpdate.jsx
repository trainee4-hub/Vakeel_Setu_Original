import { useNavigate } from "react-router-dom";
import UpdateForm from "@features/admin/components/forms/UpdateForm";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";

export default function CreateUpdate() {
  const navigate = useNavigate();
  return <UpdateForm mode="create" onSaved={(saved) => navigate(ADMIN_PATHS.updates.list, { state: { created: saved ?? null } })} />;
}
