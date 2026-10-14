import usePaginatedList from "@shared/hooks/usePaginatedList";
import useDeleteFlow from "@shared/hooks/useDeleteFlow";
import { deleteUpdate, getUpdates } from "@features/admin/services/content/updatesApi";
import { ADMIN_PATHS, formatDate } from "@features/admin/utils/adminUtils";
import PageHeader from "@shared/components/ui/PageHeader";
import EmptyState from "@shared/components/feedback/EmptyState";
import ErrorState from "@shared/components/feedback/ErrorState";
import Pagination from "@shared/components/ui/Pagination";
import ResourceTable from "@shared/components/ui/ResourceTable";
import DeleteConfirmationModal from "@shared/components/ui/DeleteConfirmationModal";
import { ListSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { LinkButton } from "@shared/components/ui/Button";
import { richTextToPlain } from "@shared/utils/richText";

const COLUMNS = [
  {
    key: "update",
    header: "Update",
    primary: true,
    className: "w-[60%]",
    render: (update) => (
      <div className="min-w-0">
        <p className="line-clamp-1 font-semibold text-slate-900">{update.title}</p>
        <p className="line-clamp-2 text-xs text-slate-500">
          <span className="font-medium text-emerald-700">Now: </span>
          {richTextToPlain(update.newDescription)}
        </p>
      </div>
    ),
  },
  { key: "createdAt", header: "Posted", render: (update) => formatDate(update.createdAt) },
  { key: "updatedAt", header: "Updated", render: (update) => formatDate(update.updatedAt) },
];

export default function UpdatesList() {
  const { status, items, pagination, error, setPage, reload, afterDelete } = usePaginatedList(getUpdates);
  const { requestDelete, modalProps } = useDeleteFlow(deleteUpdate, {
    successMessage: "Update deleted.",
    onDeleted: afterDelete,
  });

  const createButton = (
    <LinkButton to={ADMIN_PATHS.updates.create} icon="add">
      Post Update
    </LinkButton>
  );

  let body;
  if (status === "loading" && !items.length) body = <ListSkeleton />;
  else if (status === "error") body = <ErrorState message={error?.message} onRetry={reload} />;
  else if (!items.length) {
    body = <EmptyState icon="update" title="No updates available." description="Post your first legal update." action={createButton} />;
  } else {
    body = (
      <>
        <ResourceTable
          caption="Updates"
          items={items}
          columns={COLUMNS}
          busy={status === "loading"}
          actions={(update) => [
            { key: "edit", label: "Edit", icon: "edit", to: ADMIN_PATHS.updates.edit(update.id) },
            { key: "delete", label: "Delete", icon: "delete", tone: "danger", onClick: () => requestDelete(update) },
          ]}
        />
        <Pagination pagination={pagination} onPageChange={setPage} disabled={status === "loading"} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Updates" description="What changed in the law or on the platform, and how." actions={createButton} />
      {body}
      <DeleteConfirmationModal
        open={modalProps.open}
        title="Delete Update?"
        itemName={modalProps.target?.title}
        confirmLabel="Delete Update"
        loading={modalProps.loading}
        onCancel={modalProps.onCancel}
        onConfirm={modalProps.onConfirm}
      />
    </>
  );
}
