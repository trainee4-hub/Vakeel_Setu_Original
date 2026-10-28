import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  actLabel,
  categoryLabel,
  getActSections,
  getActsByBearerAct,
  getAllActs,
  getAllBearerActs,
  getBearerActs,
  recordId,
} from "@features/admin/services/content/bareActsApi";
import useAsyncOptions from "@shared/hooks/useAsyncOptions";
import useBareActsList from "@features/admin/hooks/useBareActsList";
import { ADMIN_PATHS, formatDate } from "@features/admin/utils/adminUtils";
import { richTextExcerpt } from "@shared/utils/richText";
import PageHeader from "@shared/components/ui/PageHeader";
import Card from "@shared/components/ui/Card";
import EmptyState from "@shared/components/feedback/EmptyState";
import ErrorState from "@shared/components/feedback/ErrorState";
import Pagination from "@shared/components/ui/Pagination";
import ResourceTable from "@shared/components/ui/ResourceTable";
import { ListSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { LinkButton } from "@shared/components/ui/Button";
import { FormField } from "@shared/components/ui/FormControls";
import { fieldClass } from "@shared/components/ui/styles";
import { cleanChapterName, cleanChapterNo } from "@features/legalHub/components/lawLibrary/lawLibraryUtils";

/* =========================================================================
   BARE ACTS — Categories → Acts → Sections.

   Reads: public GET /bearer-acts, /bearer-acts/:id/acts, /acts/:id/sections
   Writes: writeBearerAct (CREATE/UPDATE only — no delete
   operation exists in the contract, so no delete action is offered).
   ========================================================================= */

const TABS = [
  { key: "categories", label: "Categories" },
  { key: "acts", label: "Acts" },
  { key: "sections", label: "Sections" },
];

export default function BareActsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab = TABS.some((entry) => entry.key === requested) ? requested : "categories";

  const selectTab = (key) => {
    const params = new URLSearchParams(searchParams);
    if (key === "categories") params.delete("tab");
    else params.set("tab", key);
    setSearchParams(params, { replace: true });
  };

  return (
    <>
      <PageHeader title="Bare Acts" description="Manage Bare Act categories, Acts and their sections." />

      <div role="tablist" aria-label="Bare Acts" className="mb-5 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={tab === entry.key}
            onClick={() => selectTab(entry.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              tab === entry.key ? "bg-amber-500 text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "categories" ? <CategoriesPanel /> : null}
      {tab === "acts" ? <ActsPanel /> : null}
      {tab === "sections" ? <SectionsPanel /> : null}
    </>
  );
}

/* ---------------------------- CATEGORIES ---------------------------- */

const CATEGORY_COLUMNS = [
  {
    key: "name",
    header: "Category",
    primary: true,
    className: "w-[60%]",
    render: (category) => <p className="font-semibold text-slate-900">{categoryLabel(category)}</p>,
  },
  { key: "createdAt", header: "Created", render: (category) => formatDate(category.createdAt) },
  { key: "updatedAt", header: "Updated", render: (category) => formatDate(category.updatedAt) },
];

function CategoriesPanel() {
  const { status, items, pagination, error, page, setPage, reload } = useBareActsList(getBearerActs, { limit: 20 });

  const addButton = (
    <LinkButton to={ADMIN_PATHS.bareActs.categories.create} icon="add">
      Add Category
    </LinkButton>
  );

  return (
    <>
      <div className="mb-4 flex justify-end">{addButton}</div>
      {status === "loading" && !items.length ? (
        <ListSkeleton />
      ) : status === "error" ? (
        <ErrorState message={error?.message} onRetry={reload} />
      ) : !items.length ? (
        <EmptyState icon="category" title="No categories yet." description="Add the first Bare Act category." action={addButton} />
      ) : (
        <>
          <ResourceTable
            caption="Bare Act categories"
            items={items}
            columns={CATEGORY_COLUMNS}
            getKey={recordId}
            busy={status === "loading"}
            actions={(category) => [
              { key: "edit", label: "Edit", icon: "edit", to: ADMIN_PATHS.bareActs.categories.edit(recordId(category)) },
            ]}
          />
          <Pagination pagination={pagination ? { ...pagination, currentPage: page } : null} onPageChange={setPage} disabled={status === "loading"} />
        </>
      )}
    </>
  );
}

/* ------------------------------- ACTS ------------------------------- */

const ACT_COLUMNS = [
  {
    key: "act",
    header: "Act",
    primary: true,
    className: "w-[60%]",
    render: (act) => (
      <div className="min-w-0">
        <p className="line-clamp-1 font-semibold text-slate-900">{act.heading || act.act}</p>
        <p className="line-clamp-1 text-xs text-slate-500">{act.act}</p>
      </div>
    ),
  },
  { key: "year", header: "Year", render: (act) => (act.year != null ? String(act.year) : "—") },
  { key: "updatedAt", header: "Updated", render: (act) => formatDate(act.updatedAt) },
];

function ActsPanel() {
  const loadCategories = useCallback(() => getAllBearerActs(), []);
  const categories = useAsyncOptions(loadCategories);
  const [categoryId, setCategoryId] = useState("");

  return (
    <>
      <Card className="mb-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <FormField
              id="acts-category"
              label="Bare Act Category"
              hint={categories.status === "error" ? categories.error?.message : undefined}
            >
              <select
                id="acts-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={categories.status === "loading"}
                className={fieldClass(false)}
              >
                <option value="">{categories.status === "loading" ? "Loading categories…" : "Select a category"}</option>
                {categories.items.map((category) => (
                  <option key={recordId(category)} value={recordId(category)}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <LinkButton
            to={`${ADMIN_PATHS.bareActs.acts.create}${categoryId ? `?category=${encodeURIComponent(categoryId)}` : ""}`}
            icon="add"
          >
            Add Act
          </LinkButton>
        </div>
      </Card>

      {categoryId ? (
        <ActsList key={categoryId} categoryId={categoryId} />
      ) : (
        <EmptyState icon="gavel" title="Select a category" description="Choose a Bare Act category to see its Acts." />
      )}
    </>
  );
}

function ActsList({ categoryId }) {
  const fetcher = useCallback((params) => getActsByBearerAct(categoryId, params), [categoryId]);
  const { status, items, pagination, error, page, setPage, reload } = useBareActsList(fetcher, { limit: 20 });

  if (status === "loading" && !items.length) return <ListSkeleton />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={reload} />;
  if (!items.length) {
    return <EmptyState icon="gavel" title="No Acts in this category yet." description="Add the first Act." />;
  }

  return (
    <>
      <ResourceTable
        caption="Acts"
        items={items}
        columns={ACT_COLUMNS}
        getKey={recordId}
        busy={status === "loading"}
        actions={(act) => [{ key: "edit", label: "Edit", icon: "edit", to: ADMIN_PATHS.bareActs.acts.edit(recordId(act)) }]}
      />
      <Pagination pagination={pagination ? { ...pagination, currentPage: page } : null} onPageChange={setPage} disabled={status === "loading"} />
    </>
  );
}

/* ----------------------------- SECTIONS ----------------------------- */

const SECTION_COLUMNS = [
  {
    key: "section",
    header: "Section",
    primary: true,
    className: "w-[55%]",
    render: (section) => (
      <div className="flex items-center gap-3">
        <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
          {section.section || "—"}
        </span>
        <div className="min-w-0">
          <p className="line-clamp-1 font-semibold text-slate-900">{section.title}</p>
          <p className="line-clamp-1 text-xs text-slate-500">{richTextExcerpt(section.description, 120)}</p>
        </div>
      </div>
    ),
  },
  {
    key: "chapter",
    header: "Chapter",
    render: (section) => {
      const cNo = cleanChapterNo(section.chapterNo);
      const cName = cleanChapterName(section.chapterName);
      const cNoFormatted = cNo ? `Ch. ${cNo}` : null;
      return [cNoFormatted, cName].filter(Boolean).join(" · ") || "—";
    },
  },
  { key: "updatedAt", header: "Updated", render: (section) => formatDate(section.updatedAt) },
];

function SectionsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "";
  const actId = searchParams.get("act") || "";

  const loadCategories = useCallback(() => getAllBearerActs(), []);
  const categories = useAsyncOptions(loadCategories);

  const loadActs = useCallback(() => getAllActs(categoryId), [categoryId]);
  const acts = useAsyncOptions(loadActs, { enabled: Boolean(categoryId) });

  const handleCategoryChange = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set("category", val);
    else next.delete("category");
    next.delete("act");
    setSearchParams(next, { replace: true });
  };

  const handleActChange = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set("act", val);
    else next.delete("act");
    setSearchParams(next, { replace: true });
  };

  const createQuery = [categoryId ? `category=${encodeURIComponent(categoryId)}` : "", actId ? `act=${encodeURIComponent(actId)}` : ""]
    .filter(Boolean)
    .join("&");

  return (
    <>
      <Card className="mb-5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <FormField id="sections-category" label="Bare Act Category">
              <select
                id="sections-category"
                value={categoryId}
                onChange={(event) => handleCategoryChange(event.target.value)}
                disabled={categories.status === "loading"}
                className={fieldClass(false)}
              >
                <option value="">{categories.status === "loading" ? "Loading categories…" : "Select a category"}</option>
                {categories.items.map((category) => (
                  <option key={recordId(category)} value={recordId(category)}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="sections-act" label="Act">
              <select
                id="sections-act"
                value={actId}
                onChange={(event) => handleActChange(event.target.value)}
                disabled={!categoryId || acts.status === "loading"}
                className={fieldClass(false)}
              >
                <option value="">
                  {!categoryId ? "Select a category first" : acts.status === "loading" ? "Loading acts…" : "Select an act"}
                </option>
                {acts.items.map((act) => (
                  <option key={recordId(act)} value={recordId(act)}>
                    {actLabel(act)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <LinkButton to={`${ADMIN_PATHS.bareActs.sections.create}${createQuery ? `?${createQuery}` : ""}`} icon="add">
            Add Section
          </LinkButton>
        </div>
      </Card>

      {actId ? (
        <SectionsList key={actId} actId={actId} />
      ) : (
        <EmptyState
          icon="menu_book"
          title="Select an Act"
          description="Choose a category and an Act to see its sections."
        />
      )}
    </>
  );
}

function SectionsList({ actId }) {
  const fetcher = useCallback((params) => getActSections(actId, params), [actId]);
  const { status, items, pagination, error, page, setPage, reload } = useBareActsList(fetcher, { limit: 20 });

  if (status === "loading" && !items.length) return <ListSkeleton />;
  if (status === "error") return <ErrorState message={error?.message} onRetry={reload} />;
  if (!items.length) {
    return <EmptyState icon="menu_book" title="No sections in this Act yet." description="Add the first section." />;
  }

  return (
    <>
      <ResourceTable
        caption="Sections"
        items={items}
        columns={SECTION_COLUMNS}
        getKey={recordId}
        busy={status === "loading"}
        actions={(section) => [
          { key: "edit", label: "Edit", icon: "edit", to: ADMIN_PATHS.bareActs.sections.edit(recordId(section)) },
        ]}
      />
      <Pagination pagination={pagination ? { ...pagination, currentPage: page } : null} onPageChange={setPage} disabled={status === "loading"} />
    </>
  );
}
