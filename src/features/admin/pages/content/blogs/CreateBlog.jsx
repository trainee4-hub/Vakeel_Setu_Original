import { useNavigate } from "react-router-dom";
import BlogForm from "@features/admin/components/forms/BlogForm";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";

export default function CreateBlog() {
  const navigate = useNavigate();
  return <BlogForm mode="create" onSaved={(saved) => navigate(ADMIN_PATHS.blogs.list, { state: { created: saved ?? null } })} />;
}
