import { useCallback, useMemo, useRef, useState } from "react";
import {
  actLabel,
  categoryLabel,
  createSection,
  getAllActs,
  getAllBearerActs,
  recordId,
  updateSection,
} from "../../services/content/bareActsApi";
import { ADMIN_PATHS, scrollToTop } from "../../utils/adminUtils";
import useAsyncOptions from "@shared/hooks/useAsyncOptions";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import { BackLink } from "@shared/components/ui/Button";
import RichTextEditor from "@shared/components/ui/RichTextEditor";
import { CharCounter, FormActions, FormErrorBanner, FormField, FormSection } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";
import { hasErrors, requireRichText, requireText } from "@shared/utils/formValidation";
import { richTextToPlain } from "@shared/utils/richText";

/*
 * type: "SECTION"
 *   CREATE { actId, section, chapterNo, chapterName, title, description,
 *            metaData, metaDescription, metaTitle }
 *   UPDATE { id, …changed fields }   ← the contract has no act move, so the
 *                                      Act is read-only on edit
 * `section` is a string ("Section 25A"); `chapterNo` is a string ("1", "4A", "IV", "IX-A").
 * `sectionNo` is NOT in the documented payload and is never sent.
 */
const TEXT_FIELDS = ["section", "chapterNo", "chapterName", "title", "description", "metaData", "metaDescription", "metaTitle"];
const OPTIONAL_FIELDS = ["chapterNo", "chapterName", "metaData", "metaDescription", "metaTitle"];
const RICH_FIELDS = ["description"];

export default function BareActSectionForm({ mode, initialSection, defaultCategoryId = "", defaultActId = "", onSaved }) {
  const isCreate = mode === "create";
  const toast = useCCToast();

  const initial = useMemo(() => {
    const value = (field) => {
      const raw = initialSection?.[field];
      if (raw == null) return "";
      const str = String(raw).trim();
      if ((field === "chapterNo" || field === "chapterName") && (str.toLowerCase() === "null" || str.toLowerCase() === "undefined")) {
        return "";
      }
      return str;
    };
    return {
      categoryId: String(initialSection?.act?.bearerActId ?? defaultCategoryId ?? ""),
      actId: String(initialSection?.actId ?? initialSection?.act?.id ?? defaultActId ?? ""),
      section: value("section"),
      chapterNo: value("chapterNo"),
      chapterName: value("chapterName"),
      title: value("title"),
      description: value("description"),
      metaData: value("metaData"),
      metaDescription: value("metaDescription"),
      metaTitle: value("metaTitle"),
    };
  }, [initialSection, defaultCategoryId, defaultActId]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  const loadCategories = useCallback(() => getAllBearerActs(), []);
  const categories = useAsyncOptions(loadCategories, { enabled: isCreate });

  const loadActs = useCallback(() => getAllActs(form.categoryId), [form.categoryId]);
  const acts = useAsyncOptions(loadActs, { enabled: isCreate && Boolean(form.categoryId) });

  const isDirty = [...TEXT_FIELDS, "actId"].some((field) => form[field] !== initial[field]);
  const { requestLeave, discardModal } = useUnsavedChangesGuard(isDirty && !submitting);

  const backTo = useMemo(() => {
    const params = new URLSearchParams({ tab: "sections" });
    const catId = form.categoryId || defaultCategoryId;
    const actId = form.actId || defaultActId;
    if (catId) params.set("category", catId);
    if (actId) params.set("act", actId);
    return `${ADMIN_PATHS.bareActs.list}?${params.toString()}`;
  }, [form.categoryId, form.actId, defaultCategoryId, defaultActId]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputProps = (field) => ({
    id: `section-${field}`,
    value: form[field],
    onChange: (event) => setField(field, event.target.value),
    disabled: submitting,
    "aria-invalid": Boolean(errors[field]) || undefined,
    "aria-describedby": describedBy(`section-${field}`, { error: errors[field] }),
    className: fieldClass(errors[field]),
  });

  const validate = () => {
    const next = {};
    if (isCreate) requireText(next, "actId", form.actId, "Choose an Act.");
    requireText(next, "section", form.section, "Enter the section, e.g. Section 25A.");

    // Conditional rule: if Chapter No is filled, Chapter Name becomes required.
    const cleanNo = form.chapterNo.trim();
    const cleanName = form.chapterName.trim();
    if (cleanNo && !cleanName) {
      next.chapterName = "Chapter name is required when chapter number is provided.";
    }

    requireText(next, "title", form.title, "Enter the section title.");
    requireRichText(next, "description", form.description, "Enter the section text.");
    return next;
  };

  /** Trimmed value for a field; rich fields kept as editor HTML. */
  const valueFor = (field) => {
    if (RICH_FIELDS.includes(field)) return richTextToPlain(form[field]) ? form[field] : "";
    const raw = form[field].trim();
    if (field === "chapterNo" || field === "chapterName") {
      if (!raw || raw.toLowerCase() === "null" || raw.toLowerCase() === "undefined") {
        return "";
      }
      return raw;
    }
    return raw;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;

    const clientErrors = validate();
    setErrors(clientErrors);
    if (hasErrors(clientErrors)) {
      setFormError("Fix the highlighted fields before saving.");
      scrollToTop();
      return;
    }

    if (!isCreate && !isDirty) {
      toast.info("No changes to save.");
      return;
    }

    inFlight.current = true;
    setFormError(null);
    setSubmitting(true);
    try {
      let saved;
      if (isCreate) {
        const data = { actId: form.actId };
        TEXT_FIELDS.forEach((field) => {
          const value = valueFor(field);
          if (OPTIONAL_FIELDS.includes(field) && (value === "" || value === null)) return;
          data[field] = value;
        });
        saved = await createSection(data);
      } else {
        // Only changed fields are sent; untouched values keep their stored content.
        const data = { id: initialSection.id };
        TEXT_FIELDS.forEach((field) => {
          if (form[field] !== initial[field]) data[field] = valueFor(field);
        });
        saved = await updateSection(data);
      }
      toast.success(isCreate ? "Section added." : "Section updated.");
      onSaved?.(saved, backTo);
    } catch (error) {
      if (error?.status === 401) return;
      setErrors(error?.fieldErrors ?? {});
      const message = error?.message || "The section could not be saved.";
      setFormError(message);
      toast.error(message);
      scrollToTop();
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const actName = initialSection?.act ? actLabel(initialSection.act) : "—";

  return (
    <>
      <PageHeader
        back={<BackLink label="Back to Bare Acts" onClick={() => requestLeave(backTo)} />}
        title={isCreate ? "Add Section" : "Edit Section"}
        description={isCreate ? "Add a section to an Act." : "Update this section's chapter, title, text or SEO details."}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormErrorBanner message={formError} />

        <FormSection title="Act">
          {isCreate ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="section-categoryId" label="Bare Act Category" required error={errors.categoryId}>
                <select
                  id="section-categoryId"
                  value={form.categoryId}
                  onChange={(event) => {
                    // Changing the category clears the stale Act selection.
                    setForm((prev) => ({ ...prev, categoryId: event.target.value, actId: "" }));
                    setErrors((prev) => ({ ...prev, actId: undefined }));
                  }}
                  disabled={submitting || categories.status === "loading"}
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

              <FormField id="section-actId" label="Act" required error={errors.actId}>
                <select {...inputProps("actId")} disabled={submitting || !form.categoryId || acts.status === "loading"}>
                  <option value="">
                    {!form.categoryId
                      ? "Select a category first"
                      : acts.status === "loading"
                        ? "Loading acts…"
                        : "Select an act"}
                  </option>
                  {acts.items.map((act) => (
                    <option key={recordId(act)} value={recordId(act)}>
                      {actLabel(act)}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          ) : (
            <FormField id="section-act-readonly" label="Act" hint="The Act can't be changed from this screen.">
              <input id="section-act-readonly" type="text" value={actName} readOnly disabled className={fieldClass(false)} />
            </FormField>
          )}
        </FormSection>

        <FormSection title="Section">
          <div className="grid gap-5 sm:grid-cols-[200px_140px_1fr]">
            <FormField id="section-section" label="Section" required error={errors.section}>
              <input type="text" placeholder="Section 25A" {...inputProps("section")} />
            </FormField>
            <FormField id="section-chapterNo" label="Chapter No" error={errors.chapterNo}>
              <input type="text" placeholder="1, 4A, IV" {...inputProps("chapterNo")} />
            </FormField>
            <FormField id="section-chapterName" label="Chapter Name" required={Boolean(form.chapterNo.trim())} error={errors.chapterName}>
              <input type="text" placeholder="Preliminary" {...inputProps("chapterName")} />
            </FormField>
          </div>

          <FormField id="section-title" label="Title" required error={errors.title}>
            <input type="text" placeholder="Title and extent of operation of the Code" {...inputProps("title")} />
          </FormField>

          <FormField
            id="section-description"
            label="Description"
            required
            error={errors.description}
                        counter={<CharCounter value={richTextToPlain(form.description)} />}
          >
            <RichTextEditor
              id="section-description"
              ariaLabel="Section description"
              size="lg"
              value={form.description}
              onChange={(html) => setField("description", html)}
              placeholder="This Act shall be called the Indian Penal Code…"
              disabled={submitting}
              invalid={Boolean(errors.description)}
              describedBy={describedBy("section-description", { error: errors.description })}
            />
          </FormField>
        </FormSection>

        <FormSection title="SEO" description="How this section appears in search results.">
          <FormField id="section-metaTitle" label="Meta Title" error={errors.metaTitle}>
            <input type="text" placeholder="Section 1 - Indian Penal Code" {...inputProps("metaTitle")} />
          </FormField>
          <FormField id="section-metaData" label="Meta Data" error={errors.metaData}>
            <input type="text" placeholder="Chapter I Preliminary" {...inputProps("metaData")} />
          </FormField>
          <FormField id="section-metaDescription" label="Meta Description" error={errors.metaDescription}>
            <textarea rows={3} {...inputProps("metaDescription")} />
          </FormField>
        </FormSection>

        <FormActions
          onCancel={() => requestLeave(backTo)}
          submitting={submitting}
          submitLabel={isCreate ? "Add Section" : "Save Changes"}
          submittingLabel="Saving…"
        />
      </form>
      {discardModal}
    </>
  );
}
