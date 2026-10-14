import usePaginatedList from "@shared/hooks/usePaginatedList";
import useDeleteFlow from "@shared/hooks/useDeleteFlow";
import { deleteBlog, getBlogs } from "@features/admin/services/content/blogApi";
import { ADMIN_PATHS, PUBLIC_VIEW_PATHS, formatDate } from "@features/admin/utils/adminUtils";
import PageHeader from "@shared/components/ui/PageHeader";
import EmptyState from "@shared/components/feedback/EmptyState";
import ErrorState from "@shared/components/feedback/ErrorState";
import Pagination from "@shared/components/ui/Pagination";
import ResourceTable from "@shared/components/ui/ResourceTable";
import DeleteConfirmationModal from "@shared/components/ui/DeleteConfirmationModal";
import { ListSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Icon, LinkButton } from "@shared/components/ui/Button";

const blogImage = (blog) => blog.image ?? blog.imageUrl ?? null;

const COLUMNS = [
  {
    key: "article",
    header: "Article",
    primary: true,
    className: "w-[46%]",
    render: (blog) => (
      <div className="flex items-center gap-3">
        {blogImage(blog) ? (
          <img src={blogImage(blog)} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" loading="lazy" />
        ) : (
          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <Icon name="image" className="text-[20px]" />
          </div>
        )}
        <div className="min-w-0">
          {blog.heading ? <p className="truncate text-xs font-medium text-amber-700">{blog.heading}</p> : null}
          <p className="line-clamp-2 font-semibold text-slate-900">{blog.title}</p>
        </div>
      </div>
    ),
  },
  { key: "writtenBy", header: "Written by", render: (blog) => blog.writtenBy || "—" },
  { key: "date", header: "Published", render: (blog) => formatDate(blog.date) },
  { key: "updatedAt", header: "Updated", render: (blog) => formatDate(blog.updatedAt) },
];

export default function BlogList() {
  const { status, items, pagination, error, setPage, reload, afterDelete } = usePaginatedList(getBlogs);
  const { requestDelete, modalProps } = useDeleteFlow(deleteBlog, {
    successMessage: "Blog deleted.",
    onDeleted: afterDelete,
  });

  const createButton = (
    <LinkButton to={ADMIN_PATHS.blogs.create} icon="add">
      Create Blog
    </LinkButton>
  );

  let body;
  if (status === "loading" && !items.length) body = <ListSkeleton />;
  else if (status === "error") body = <ErrorState message={error?.message} onRetry={reload} />;
  else if (!items.length) {
    body = <EmptyState icon="article" title="No blogs created yet." description="Create your first blog." action={createButton} />;
  } else {
    body = (
      <>
        <ResourceTable
          caption="Blogs"
          items={items}
          columns={COLUMNS}
          busy={status === "loading"}
          actions={(blog) => [
            PUBLIC_VIEW_PATHS.blog(blog) && { key: "view", label: "View", icon: "visibility", href: PUBLIC_VIEW_PATHS.blog(blog) },
            { key: "edit", label: "Edit", icon: "edit", to: ADMIN_PATHS.blogs.edit(blog.id) },
            { key: "delete", label: "Delete", icon: "delete", tone: "danger", onClick: () => requestDelete(blog) },
          ]}
        />
        <Pagination pagination={pagination} onPageChange={setPage} disabled={status === "loading"} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Blogs" description="Manage published legal articles." actions={createButton} />
      {body}
      <DeleteConfirmationModal
        open={modalProps.open}
        title="Delete Blog?"
        itemName={modalProps.target?.title}
        confirmLabel="Delete Blog"
        loading={modalProps.loading}
        onCancel={modalProps.onCancel}
        onConfirm={modalProps.onConfirm}
      />
    </>
  );
}
