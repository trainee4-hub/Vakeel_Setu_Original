import { useNavigate, useParams } from "react-router-dom";
import useRecord from "@shared/hooks/useRecord";
import { getUserRight } from "@features/admin/services/content/userRightsApi";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";
import UserRightForm from "@features/admin/components/forms/UserRightForm";
import PageHeader from "@shared/components/ui/PageHeader";
import ErrorState from "@shared/components/feedback/ErrorState";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { BackLink, LinkButton } from "@shared/components/ui/Button";

export default function EditUserRight() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, record, error, reload } = useRecord(getUserRight, id);
  const back = <BackLink to={ADMIN_PATHS.userRights.list} label="Back to User Rights" />;

  if (status === "loading") {
    return (
      <>
        <PageHeader back={back} title="Edit User Right" />
        <FormSkeleton />
      </>
    );
  }

  if (status !== "success") {
    const notFound = error?.status === 404;
    return (
      <>
        <PageHeader back={back} title="Edit User Right" />
        <ErrorState
          title={notFound ? "User right not found" : "Couldn't load this user right"}
          message={notFound ? "It may have been deleted." : error?.message}
          onRetry={notFound ? undefined : reload}
          action={
            <LinkButton to={ADMIN_PATHS.userRights.list} variant="secondary">
              View all user rights
            </LinkButton>
          }
        />
      </>
    );
  }

  return (
    <UserRightForm key={record.id} mode="edit" initialRight={record} onSaved={() => navigate(ADMIN_PATHS.userRights.list)} />
  );
}
