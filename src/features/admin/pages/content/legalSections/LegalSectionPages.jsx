import { useLocation, useNavigate, useParams } from "react-router-dom";
import LegalSectionForm from "@features/admin/components/forms/LegalSectionForm";
import { LEGAL_SECTION_META, sectionIdOf } from "@features/admin/components/forms/legalSectionMeta";
import PageHeader from "@shared/components/ui/PageHeader";
import { BackLink, LinkButton } from "@shared/components/ui/Button";
import EmptyState from "@shared/components/feedback/EmptyState";
import ErrorState from "@shared/components/feedback/ErrorState";
import Pagination from "@shared/components/ui/Pagination";
import ResourceTable from "@shared/components/ui/ResourceTable";
import { FormSkeleton, ListSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import useRecord from "@shared/hooks/useRecord";
import usePaginatedList from "@shared/hooks/usePaginatedList";
import { formatDate } from "@features/admin/utils/adminUtils";
import { richTextToPlain } from "@shared/utils/richText";

/*
 * IPC and BNS pages.
 *
 * List: public GET /{ipc|bns}?page=&limit=
 * Create / Edit: admin services write to backend APIs
 * Edit prefill: public GET /{ipc|bns}/:id (or data handed over after save).
 * No creator delete endpoint is documented, so there is no Delete action.
 */

/* ------------------------------ LIST ------------------------------ */

const sectionColumns = (codeLabel) => [
  {
    key: "section",
    header: "Section",
    primary: true,
    className: "w-[62%]",
    render: (section) => (
      <div className="flex items-center gap-3">
        <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold tabular-nums text-amber-700">
          {codeLabel} {section.sectionNo || "—"}
        </span>
        <div className="min-w-0">
          <p className="line-clamp-1 font-semibold text-slate-900">{section.heading}</p>
          <p className="line-clamp-1 text-xs text-slate-500">{richTextToPlain(section.paragraph)}</p>
        </div>
      </div>
    ),
  },
  { key: "createdAt", header: "Created", render: (section) => formatDate(section.createdAt) },
  { key: "updatedAt", header: "Updated", render: (section) => formatDate(section.updatedAt) },
];

export function LegalSectionListPage({ type }) {
  const meta = LEGAL_SECTION_META[type];
  const { status, items, pagination, error, setPage, reload } = usePaginatedList(meta.list, { limit: 15 });

  const createButton = (
    <LinkButton to={meta.paths.create} icon="add">
      Add {meta.singular}
    </LinkButton>
  );

  let body;
  if (status === "loading" && !items.length) body = <ListSkeleton />;
  else if (status === "error") body = <ErrorState message={error?.message} onRetry={reload} />;
  else if (!items.length) {
    body = (
      <EmptyState
        icon={meta.icon}
        title={`No ${meta.label} yet.`}
        description={`Add the first ${meta.singular}.`}
        action={createButton}
      />
    );
  } else {
    body = (
      <>
        <ResourceTable
          caption={meta.label}
          items={items}
          columns={sectionColumns(type)}
          getKey={(section) => sectionIdOf(section) ?? section.sectionNo}
          busy={status === "loading"}
          actions={(section) => [
            sectionIdOf(section) && {
              key: "edit",
              label: "Edit",
              icon: "edit",
              to: meta.paths.edit(sectionIdOf(section)),
            },
          ]}
        />
        <Pagination pagination={pagination} onPageChange={setPage} disabled={status === "loading"} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={meta.label} description={`Manage ${meta.code} reference sections.`} actions={createButton} />
      {body}
    </>
  );
}

/* ----------------------------- CREATE ----------------------------- */

export function LegalSectionCreatePage({ type }) {
  const meta = LEGAL_SECTION_META[type];
  const navigate = useNavigate();

    // Same destination as a successful create: back to the section list.
  const handleSaved = () => navigate(meta.paths.list);

  return <LegalSectionForm type={type} mode="create" onSaved={handleSaved} />;
}

/* ------------------------------ EDIT ------------------------------ */

export function LegalSectionEditPage({ type }) {
  const meta = LEGAL_SECTION_META[type];
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Data handed over right after create/save avoids a second request;
  // otherwise the record is loaded from GET /{ipc|bns}/:id.
  const stateSection = location.state?.section;
  const handedOver = stateSection && String(sectionIdOf(stateSection)) === String(id) ? stateSection : null;
  const { status, record, error, reload } = useRecord(meta.getById, handedOver ? null : id);
  const initialSection = handedOver ?? record;

    // Same destination as a successful create: back to the section list.
  const handleSaved = () => navigate(meta.paths.list);

  const back = <BackLink to={meta.paths.list} label={`Back to ${meta.label}`} />;

  if (!handedOver && status === "loading") {
    return (
      <>
        <PageHeader back={back} title={`Edit ${meta.singular}`} />
        <FormSkeleton />
      </>
    );
  }

  if (!initialSection) {
    const notFound = error?.status === 404;
    return (
      <>
        <PageHeader back={back} title={`Edit ${meta.singular}`} />
        <ErrorState
          title={notFound ? `${meta.singular} not found` : `Couldn't load this ${meta.singular}`}
          message={notFound ? "Check the record ID — it may have been removed." : error?.message}
          onRetry={notFound ? undefined : reload}
          action={
            <LinkButton to={meta.paths.list} variant="secondary">
              Back to {meta.label}
            </LinkButton>
          }
        />
      </>
    );
  }

  return (
    <LegalSectionForm
      key={`${id}-${location.key}`}
      type={type}
      mode="edit"
      sectionId={id}
      initialSection={initialSection}
      onSaved={handleSaved}
    />
  );
}