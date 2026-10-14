import usePaginatedList from "@shared/hooks/usePaginatedList";
import useDeleteFlow from "@shared/hooks/useDeleteFlow";
import { deleteUserRight, getUserRights } from "@features/admin/services/content/userRightsApi";
import { ADMIN_PATHS, PUBLIC_VIEW_PATHS, formatDate } from "@features/admin/utils/adminUtils";
import PageHeader from "@shared/components/ui/PageHeader";
import EmptyState from "@shared/components/feedback/EmptyState";
import ErrorState from "@shared/components/feedback/ErrorState";
import Pagination from "@shared/components/ui/Pagination";
import ResourceTable from "@shared/components/ui/ResourceTable";
import DeleteConfirmationModal from "@shared/components/ui/DeleteConfirmationModal";
import { ListSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Icon, LinkButton } from "@shared/components/ui/Button";
import { richTextToPlain } from "@shared/utils/richText";

const COLUMNS = [
  {
    key: "right",
    header: "Right",
    primary: true,
    className: "w-[55%]",
    render: (right) => (
      <div className="flex items-center gap-3">
        {right.photo ? (
          <img src={right.photo} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" loading="lazy" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Icon name="verified_user" className="text-[20px]" />
          </div>
        )}
        <div className="min-w-0">
          <p className="line-clamp-1 font-semibold text-slate-900">{right.title}</p>
          <p className="line-clamp-2 text-xs text-slate-500">{richTextToPlain(right.description)}</p>
        </div>
      </div>
    ),
  },
  { key: "createdAt", header: "Created", render: (right) => formatDate(right.createdAt) },
  { key: "updatedAt", header: "Updated", render: (right) => formatDate(right.updatedAt) },
];

export default function UserRightsList() {
  const { status, items, pagination, error, setPage, reload, afterDelete } = usePaginatedList(getUserRights);
  const { requestDelete, modalProps } = useDeleteFlow(deleteUserRight, {
    successMessage: "User right deleted.",
    onDeleted: afterDelete,
  });

  const createButton = (
    <LinkButton to={ADMIN_PATHS.userRights.create} icon="add">
      Add User Right
    </LinkButton>
  );

  let body;
  if (status === "loading" && !items.length) body = <ListSkeleton />;
  else if (status === "error") body = <ErrorState message={error?.message} onRetry={reload} />;
  else if (!items.length) {
    body = <EmptyState icon="verified_user" title="No user rights available." description="Add a user right." action={createButton} />;
  } else {
    body = (
      <>
        <ResourceTable
          caption="User rights"
          items={items}
          columns={COLUMNS}
          busy={status === "loading"}
          actions={(right) => [
            PUBLIC_VIEW_PATHS.userRight(right) && {
              key: "view",
              label: "View",
              icon: "visibility",
              href: PUBLIC_VIEW_PATHS.userRight(right),
            },
            { key: "edit", label: "Edit", icon: "edit", to: ADMIN_PATHS.userRights.edit(right.id) },
            { key: "delete", label: "Delete", icon: "delete", tone: "danger", onClick: () => requestDelete(right) },
          ]}
        />
        <Pagination pagination={pagination} onPageChange={setPage} disabled={status === "loading"} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="User Rights" description="Plain-language explanations of citizens' legal rights." actions={createButton} />
      {body}
      <DeleteConfirmationModal
        open={modalProps.open}
        title="Delete User Right?"
        itemName={modalProps.target?.title}
        confirmLabel="Delete User Right"
        loading={modalProps.loading}
        onCancel={modalProps.onCancel}
        onConfirm={modalProps.onConfirm}
      />
    </>
  );
}
