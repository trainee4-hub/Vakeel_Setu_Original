import usePaginatedList from "@shared/hooks/usePaginatedList";
import useDeleteFlow from "@shared/hooks/useDeleteFlow";
import { deleteGuide, getGuides } from "@features/admin/services/content/guidesApi";
import { ADMIN_PATHS, PUBLIC_VIEW_PATHS, formatDate } from "@features/admin/utils/adminUtils";
import { richTextToPlain } from "@shared/utils/richText";
import PageHeader from "@shared/components/ui/PageHeader";
import EmptyState from "@shared/components/feedback/EmptyState";
import ErrorState from "@shared/components/feedback/ErrorState";
import Pagination from "@shared/components/ui/Pagination";
import ResourceTable from "@shared/components/ui/ResourceTable";
import DeleteConfirmationModal from "@shared/components/ui/DeleteConfirmationModal";
import { ListSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { LinkButton } from "@shared/components/ui/Button";

const COLUMNS = [
  {
    key: "guide",
    header: "Guide",
    primary: true,
    className: "w-[58%]",
    render: (guide) => (
      <div className="min-w-0">
        <p className="line-clamp-1 font-semibold text-slate-900">{guide.title}</p>
        <p className="line-clamp-2 text-xs text-slate-500">{richTextToPlain(guide.description)}</p>
      </div>
    ),
  },
  { key: "createdAt", header: "Created", render: (guide) => formatDate(guide.createdAt) },
  { key: "updatedAt", header: "Updated", render: (guide) => formatDate(guide.updatedAt) },
];

export default function GuidesList() {
  const { status, items, pagination, error, setPage, reload, afterDelete } = usePaginatedList(getGuides);
  const { requestDelete, modalProps } = useDeleteFlow(deleteGuide, {
    successMessage: "Guide deleted.",
    onDeleted: afterDelete,
  });

  const createButton = (
    <LinkButton to={ADMIN_PATHS.guides.create} icon="add">
      Create Guide
    </LinkButton>
  );

  let body;
  if (status === "loading" && !items.length) body = <ListSkeleton />;
  else if (status === "error") body = <ErrorState message={error?.message} onRetry={reload} />;
  else if (!items.length) {
    body = <EmptyState icon="menu_book" title="No guides available." description="Create a legal guide." action={createButton} />;
  } else {
    body = (
      <>
        <ResourceTable
          caption="Guides"
          items={items}
          columns={COLUMNS}
          busy={status === "loading"}
          actions={(guide) => [
            PUBLIC_VIEW_PATHS.guide(guide) && { key: "view", label: "View", icon: "visibility", href: PUBLIC_VIEW_PATHS.guide(guide) },
            { key: "edit", label: "Edit", icon: "edit", to: ADMIN_PATHS.guides.edit(guide.id) },
            { key: "delete", label: "Delete", icon: "delete", tone: "danger", onClick: () => requestDelete(guide) },
          ]}
        />
        <Pagination pagination={pagination} onPageChange={setPage} disabled={status === "loading"} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Guides" description="Educational guides that walk people through legal processes." actions={createButton} />
      {body}
      <DeleteConfirmationModal
        open={modalProps.open}
        title="Delete Guide?"
        itemName={modalProps.target?.title}
        confirmLabel="Delete Guide"
        loading={modalProps.loading}
        onCancel={modalProps.onCancel}
        onConfirm={modalProps.onConfirm}
      />
    </>
  );
}
