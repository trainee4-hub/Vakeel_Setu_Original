import { useNavigate, useParams } from "react-router-dom";
import useRecord from "@shared/hooks/useRecord";
import { getGuide } from "@features/admin/services/content/guidesApi";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";
import GuideForm from "@features/admin/components/forms/GuideForm";
import PageHeader from "@shared/components/ui/PageHeader";
import ErrorState from "@shared/components/feedback/ErrorState";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { BackLink, LinkButton } from "@shared/components/ui/Button";

export default function EditGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, record, error, reload } = useRecord(getGuide, id);
  const back = <BackLink to={ADMIN_PATHS.guides.list} label="Back to Guides" />;

  if (status === "loading") {
    return (
      <>
        <PageHeader back={back} title="Edit Guide" />
        <FormSkeleton />
      </>
    );
  }

  if (status !== "success") {
    const notFound = error?.status === 404;
    return (
      <>
        <PageHeader back={back} title="Edit Guide" />
        <ErrorState
          title={notFound ? "Guide not found" : "Couldn't load this guide"}
          message={notFound ? "It may have been deleted." : error?.message}
          onRetry={notFound ? undefined : reload}
          action={
            <LinkButton to={ADMIN_PATHS.guides.list} variant="secondary">
              View all guides
            </LinkButton>
          }
        />
      </>
    );
  }

  return <GuideForm key={record.id} mode="edit" initialGuide={record} onSaved={() => navigate(ADMIN_PATHS.guides.list)} />;
}