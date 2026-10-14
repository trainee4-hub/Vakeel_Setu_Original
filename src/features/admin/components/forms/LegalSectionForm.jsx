import { useMemo, useRef, useState } from "react";
import { hasErrors, keywordsToInput, parseKeywords, requireRichText, requireText } from "@shared/utils/formValidation";
import { richTextToPlain } from "@shared/utils/richText";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import { BackLink } from "@shared/components/ui/Button";
import RichTextEditor from "@shared/components/ui/RichTextEditor";
import { CharCounter, FormActions, FormErrorBanner, FormField, FormSection } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";
import { scrollToTop } from "../../utils/adminUtils";
import { LEGAL_SECTION_META } from "./legalSectionMeta";

/*
 * IPC / BNS payload (identical for both):
 *
 *   sectionNo        string  (trimmed)
 *   heading          string  (trimmed)            ← "Section Heading"
 *   paragraph        string  (editor HTML)         ← "Section Context"
 *   explanation      string  (editor HTML)         ← "Section Explanation"
 *   content          string  (editor HTML)         ← "Additional Content"
 *   metaTitle        string  (trimmed)
 *   keywords         string[] (trimmed, no empties, no duplicates)
 *   metaDescription  string  (trimmed)
 */

const PLAIN_FIELDS = ["sectionNo", "heading", "paragraph", "metaTitle", "metaDescription"];
const RICH_FIELDS = ["explanation", "content"];
const ALL_FIELDS = [...PLAIN_FIELDS, ...RICH_FIELDS, "keywords"];

function sectionToForm(section) {
  const toText = (value) => (value === null || value === undefined ? "" : String(value));
  return {
    sectionNo: toText(section?.sectionNo),
    heading: toText(section?.heading),
    paragraph: toText(section?.paragraph),
    explanation: toText(section?.explanation),
    content: toText(section?.content),
    metaTitle: toText(section?.metaTitle),
    keywords: keywordsToInput(section?.keywords),
    metaDescription: toText(section?.metaDescription),
  };
}

/** Comma-separated input → trimmed array, empties and case-insensitive duplicates removed. */
function normalizeKeywords(value) {
  const seen = new Set();
  return parseKeywords(value).filter((keyword) => {
    const key = keyword.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Rich editors emit "" when empty; also treat "<p></p>"-style values as empty. */
const richValue = (html) => (richTextToPlain(html) ? html : "");

function buildPayload(form) {
  return {
    sectionNo: form.sectionNo.trim(),
    heading: form.heading.trim(),
    paragraph: richValue(form.paragraph),
    explanation: richValue(form.explanation),
    content: richValue(form.content),
    metaTitle: form.metaTitle.trim(),
    keywords: normalizeKeywords(form.keywords),
    metaDescription: form.metaDescription.trim(),
  };
}

/** Edit: send only what changed (PATCH supports partial updates). */
function changedPayload(form, initial) {
  const next = buildPayload(form);
  const before = buildPayload(initial);
  const body = {};
  Object.keys(next).forEach((field) => {
    const changed =
      field === "keywords"
        ? next.keywords.join("\u0000") !== before.keywords.join("\u0000")
        : next[field] !== before[field];
    if (changed) body[field] = next[field];
  });
  return body;
}

function validate(form) {
  const errors = {};
  // sectionNo stays required: the section is identified by its number.
  requireText(errors, "sectionNo", form.sectionNo, "Enter the section number.");
  requireText(errors, "heading", form.heading, "Enter the section heading.");
  requireRichText(errors, "paragraph", form.paragraph, "Enter the section context.");
  return errors;
}

export default function LegalSectionForm({ type, mode, sectionId, initialSection, onSaved }) {
  const meta = LEGAL_SECTION_META[type];
  const isCreate = mode === "create";
  const toast = useCCToast();

  const initial = useMemo(() => sectionToForm(initialSection), [initialSection]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false); // blocks a second POST/PATCH before re-render

  const isDirty = ALL_FIELDS.some((field) => form[field] !== initial[field]);
  const { requestLeave, discardModal } = useUnsavedChangesGuard(isDirty && !submitting);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputProps = (field, hint) => ({
    id: `legal-${field}`,
    value: form[field],
    onChange: (event) => setField(field, event.target.value),
    disabled: submitting,
    "aria-invalid": Boolean(errors[field]) || undefined,
    "aria-describedby": describedBy(`legal-${field}`, { error: errors[field], hint }),
    className: fieldClass(errors[field]),
  });

  const editorProps = (field, ariaLabel, size) => ({
    id: `legal-${field}`,
    ariaLabel,
    size,
    value: form[field],
    onChange: (html) => setField(field, html),
    disabled: submitting,
    invalid: Boolean(errors[field]),
    describedBy: describedBy(`legal-${field}`, { error: errors[field] }),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;

    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (hasErrors(clientErrors)) {
            setFormError("Fix the highlighted fields before saving.");
      scrollToTop();
      return;
    }

    const body = isCreate ? buildPayload(form) : changedPayload(form, initial);
    if (!isCreate && !Object.keys(body).length) {
      toast.info("No changes to save.");
      return;
    }

    inFlight.current = true;
    setFormError(null);
    setSubmitting(true);
    try {
      const saved = isCreate ? await meta.create(body) : await meta.update(sectionId, body);
      toast.success(isCreate ? `${meta.singular} added.` : `${meta.singular} updated.`);
      onSaved?.(saved, body);
    } catch (error) {
      if (error?.status === 401) return; // layout ends the session
      setErrors(error?.fieldErrors ?? {});
            const message = error?.message || `The ${meta.singular} could not be saved.`;
      setFormError(message);
      toast.error(message);
      scrollToTop();
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const keywordsHint = `Separate with commas, e.g. ${meta.examples.keywords}`;
  const title = isCreate
    ? `Add ${meta.singular}`
    : `Edit ${meta.singular}${initialSection?.sectionNo ? ` ${initialSection.sectionNo}` : ""}`;

  return (
    <>
      <PageHeader
        back={<BackLink label={`Back to ${meta.label}`} onClick={() => requestLeave(meta.paths.list)} />}
        title={title}
        description={isCreate ? `Add a ${meta.code} section.` : "Update the section text or its SEO details."}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormErrorBanner message={formError} />

        <FormSection title="Section" description={meta.code}>
          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            <FormField id="legal-sectionNo" label="Section Number" required error={errors.sectionNo}>
              <input type="text" inputMode="text" placeholder={meta.examples.sectionNo} {...inputProps("sectionNo")} />
            </FormField>
            <FormField id="legal-heading" label="Section Heading" required error={errors.heading}>
              <input type="text" placeholder={meta.examples.heading} {...inputProps("heading")} />
            </FormField>
          </div>

          <FormField
            id="legal-paragraph"
            label="Section Context"
            required
            error={errors.paragraph}
            counter={<CharCounter value={richTextToPlain(form.paragraph)} />}
          >
            <RichTextEditor
              placeholder="Whoever commits…"
              {...editorProps("paragraph", "Section context", "md")}
            />
          </FormField>

          <FormField id="legal-explanation" label="Section Explanation" optional error={errors.explanation}>
            <RichTextEditor
              placeholder="Explain the section in plain language…"
              {...editorProps("explanation", "Section explanation", "md")}
            />
          </FormField>

          <FormField
            id="legal-content"
            label="Additional Content"
            optional
            error={errors.content}
            counter={<CharCounter value={richTextToPlain(form.content)} />}
          >
            <RichTextEditor
              placeholder="Detailed provisions, illustrations, judicial precedents…"
              {...editorProps("content", "Additional content", "lg")}
            />
          </FormField>
        </FormSection>

        <FormSection title="SEO" description="How this section appears in search results.">
          <FormField
            id="legal-metaTitle"
            label="Meta Title"
            error={errors.metaTitle}
            counter={<CharCounter value={form.metaTitle} />}
          >
            <input type="text" {...inputProps("metaTitle")} />
          </FormField>
          <FormField id="legal-keywords" label="Keywords" hint={keywordsHint} error={errors.keywords}>
            <input type="text" {...inputProps("keywords", keywordsHint)} />
          </FormField>
          <FormField
            id="legal-metaDescription"
            label="Meta Description"
            error={errors.metaDescription}
            counter={<CharCounter value={form.metaDescription} />}
          >
            <textarea rows={3} {...inputProps("metaDescription")} />
          </FormField>
        </FormSection>

        <FormActions
          onCancel={() => requestLeave(meta.paths.list)}
          submitting={submitting}
          submitLabel={isCreate ? `Add ${meta.singular}` : "Save Changes"}
          submittingLabel="Saving…"
        />
      </form>
      {discardModal}
    </>
  );
}