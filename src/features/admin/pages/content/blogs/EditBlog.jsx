import { useNavigate, useParams } from "react-router-dom";
import useRecord from "@shared/hooks/useRecord";
import { getBlog } from "@features/admin/services/content/blogApi";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";
import BlogForm from "@features/admin/components/forms/BlogForm";
import PageHeader from "@shared/components/ui/PageHeader";
import ErrorState from "@shared/components/feedback/ErrorState";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { BackLink, LinkButton } from "@shared/components/ui/Button";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, record, error, reload } = useRecord(getBlog, id);
  const back = <BackLink to={ADMIN_PATHS.blogs.list} label="Back to Blogs" />;

  if (status === "loading") {
    return (
      <>
        <PageHeader back={back} title="Edit Blog" />
        <FormSkeleton />
      </>
    );
  }

  if (status !== "success") {
    const notFound = error?.status === 404;
    return (
      <>
        <PageHeader back={back} title="Edit Blog" />
        <ErrorState
          title={notFound ? "Blog not found" : "Couldn't load this blog"}
          message={notFound ? "It may have been deleted." : error?.message}
          onRetry={notFound ? undefined : reload}
          action={
            <LinkButton to={ADMIN_PATHS.blogs.list} variant="secondary">
              View all blogs
            </LinkButton>
          }
        />
      </>
    );
  }

  return <BlogForm key={record.id} mode="edit" initialBlog={record} onSaved={() => navigate(ADMIN_PATHS.blogs.list)} />;
}
