import { useNavigate } from "react-router-dom";
import UserRightForm from "@features/admin/components/forms/UserRightForm";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";

export default function CreateUserRight() {
  const navigate = useNavigate();
  return <UserRightForm mode="create" onSaved={(saved) => navigate(ADMIN_PATHS.userRights.list, { state: { created: saved ?? null } })} />;
}
