import { useNavigate, useParams } from "react-router-dom";
import useRecord from "@shared/hooks/useRecord";
import { getUpdate } from "@features/admin/services/content/updatesApi";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";
import UpdateForm from "@features/admin/components/forms/UpdateForm";
import PageHeader from "@shared/components/ui/PageHeader";
import ErrorState from "@shared/components/feedback/ErrorState";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { BackLink, LinkButton } from "@shared/components/ui/Button";

export default function EditUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, record, error, reload } = useRecord(getUpdate, id);
  const back = <BackLink to={ADMIN_PATHS.updates.list} label="Back to Updates" />;

  if (status === "loading") {
    return (
      <>
        <PageHeader back={back} title="Edit Update" />
        <FormSkeleton />
      </>
    );
  }

  if (status !== "success") {
    const notFound = error?.status === 404;
    return (
      <>
        <PageHeader back={back} title="Edit Update" />
        <ErrorState
          title={notFound ? "Update not found" : "Couldn't load this update"}
          message={notFound ? "It may have been deleted." : error?.message}
          onRetry={notFound ? undefined : reload}
          action={
            <LinkButton to={ADMIN_PATHS.updates.list} variant="secondary">
              View all updates
            </LinkButton>
          }
        />
      </>
    );
  }

  return <UpdateForm key={record.id} mode="edit" initialUpdate={record} onSaved={() => navigate(ADMIN_PATHS.updates.list)} />;
}
