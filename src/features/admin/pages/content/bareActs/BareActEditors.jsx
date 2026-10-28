import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useRecord from "@shared/hooks/useRecord";
import { getAct, getBearerAct, getSection } from "@features/admin/services/content/bareActsApi";
import { ADMIN_PATHS } from "@features/admin/utils/adminUtils";
import BareActCategoryForm from "@features/admin/components/forms/BareActCategoryForm";
import ActForm from "@features/admin/components/forms/ActForm";
import BareActSectionForm from "@features/admin/components/forms/BareActSectionForm";
import PageHeader from "@shared/components/ui/PageHeader";
import ErrorState from "@shared/components/feedback/ErrorState";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { BackLink, LinkButton } from "@shared/components/ui/Button";

/* Create/Edit screens for the three Bare Acts levels. Edit loads the record
   first (public GET) and the form is keyed by its id, so it never mounts with
   stale or empty state. */

const listPath = (tab) => `${ADMIN_PATHS.bareActs.list}?tab=${tab}`;

function EditorShell({ tab, title, status, error, reload, children }) {
  const back = <BackLink to={listPath(tab)} label="Back to Bare Acts" />;

  if (status === "loading") {
    return (
      <>
        <PageHeader back={back} title={title} />
        <FormSkeleton />
      </>
    );
  }

  if (status !== "success") {
    const notFound = error?.status === 404;
    return (
      <>
        <PageHeader back={back} title={title} />
        <ErrorState
          title={notFound ? "Record not found" : "Couldn't load this record"}
          message={notFound ? "It may have been removed." : error?.message}
          onRetry={notFound ? undefined : reload}
          action={
            <LinkButton to={listPath(tab)} variant="secondary">
              Back to Bare Acts
            </LinkButton>
          }
        />
      </>
    );
  }

  return children;
}

/* ---------------------------- CATEGORY ---------------------------- */

export function BareActCategoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, record, error, reload } = useRecord(getBearerAct, id);
  const onSaved = () => navigate(listPath("categories"));

  if (!id) return <BareActCategoryForm mode="create" onSaved={onSaved} />;

  return (
    <EditorShell tab="categories" title="Edit Bare Act Category" status={status} error={error} reload={reload}>
      <BareActCategoryForm key={record?.id} mode="edit" initialCategory={record} onSaved={onSaved} />
    </EditorShell>
  );
}

/* ------------------------------- ACT ------------------------------- */

export function ActEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { status, record, error, reload } = useRecord(getAct, id);
  const onSaved = () => navigate(listPath("acts"));

  if (!id) {
    return <ActForm mode="create" defaultCategoryId={searchParams.get("category") ?? ""} onSaved={onSaved} />;
  }

  return (
    <EditorShell tab="acts" title="Edit Act" status={status} error={error} reload={reload}>
      <ActForm key={record?.id} mode="edit" initialAct={record} onSaved={onSaved} />
    </EditorShell>
  );
}

/* ----------------------------- SECTION ----------------------------- */

export function SectionEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { status, record, error, reload } = useRecord(getSection, id);
  const onSaved = (saved, backTo) => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    navigate(listPath("sections"));
  };

  if (!id) {
    return (
      <BareActSectionForm
        mode="create"
        defaultCategoryId={searchParams.get("category") ?? ""}
        defaultActId={searchParams.get("act") ?? ""}
        onSaved={onSaved}
      />
    );
  }

  return (
    <EditorShell tab="sections" title="Edit Section" status={status} error={error} reload={reload}>
      <BareActSectionForm key={record?.id} mode="edit" initialSection={record} onSaved={onSaved} />
    </EditorShell>
  );
}
