import { useMemo, useRef, useState } from "react";
import { createGuide, updateGuide } from "../../services/content/guidesApi";
import { ADMIN_PATHS, scrollToTop } from "../../utils/adminUtils";
import { hasErrors, requireRichText, requireText } from "@shared/utils/formValidation";
import { richTextToPlain } from "@shared/utils/richText";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import { BackLink } from "@shared/components/ui/Button";
import RichTextEditor from "@shared/components/ui/RichTextEditor";
import { CharCounter, FormActions, FormErrorBanner, FormField, FormSection } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";

const FIELDS = ["title", "description"];

function validate(form) {
  const errors = {};
  requireText(errors, "title", form.title, "Enter a guide title.");
  requireRichText(errors, "description", form.description, "Write the guide content.");
  return errors;
}

export default function GuideForm({ mode, initialGuide, onSaved }) {
  const isCreate = mode === "create";
  const toast = useCCToast();
  const initial = useMemo(
    () => ({ title: initialGuide?.title ?? "", description: initialGuide?.description ?? "" }),
    [initialGuide],
  );
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false); // blocks a second POST/PATCH before re-render

  const isDirty = FIELDS.some((field) => form[field] !== initial[field]);
  const { requestLeave, discardModal } = useUnsavedChangesGuard(isDirty && !submitting);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Only for real DOM inputs — the rich editor hands back an HTML string.
  const update = (field) => (event) => setField(field, event.target.value);

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

    if (!isCreate && !isDirty) {
      toast.info("No changes to save.");
      return;
    }

    /* PATCH accepts partial bodies, but both fields are always sent so an
       update can never depend on change detection over editor HTML. */
    const body = { title: form.title.trim(), description: form.description.trim() };

    inFlight.current = true;
    setFormError(null);
    setSubmitting(true);
    try {
      const saved = isCreate ? await createGuide(body) : await updateGuide(initialGuide.id, body);
      toast.success(isCreate ? "Guide published." : "Guide updated.");
      onSaved?.(saved);
    } catch (error) {
      if (error?.status === 401) return;
      setErrors(error?.fieldErrors ?? {});
      const message = error?.message || "The guide could not be saved.";
      setFormError(message);
      toast.error(message);
      scrollToTop();
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        back={<BackLink label="Back to Guides" onClick={() => requestLeave(ADMIN_PATHS.guides.list)} />}
        title={isCreate ? "Create Guide" : "Edit Guide"}
        description={isCreate ? "Write a step-by-step legal guide." : "Update this guide's content."}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormErrorBanner message={formError} />

        <FormSection title="Guide" description="Use the toolbar for headings, lists, links and emphasis.">
          <FormField id="guide-title" label="Guide title" required error={errors.title}>
            <input
              id="guide-title"
              type="text"
              value={form.title}
              onChange={update("title")}
              disabled={submitting}
              placeholder="How to Find the Right Advocate"
              aria-invalid={Boolean(errors.title) || undefined}
              aria-describedby={describedBy("guide-title", { error: errors.title })}
              className={fieldClass(errors.title)}
            />
          </FormField>

          <FormField
            id="guide-description"
            label="Guide description"
            required
            error={errors.description}
            counter={<CharCounter value={richTextToPlain(form.description)} />}
          >
            <RichTextEditor
              id="guide-description"
              ariaLabel="Guide description"
              value={form.description}
              onChange={(html) => setField("description", html)}
              placeholder="Write the guide…"
              disabled={submitting}
              invalid={Boolean(errors.description)}
              describedBy={describedBy("guide-description", { error: errors.description })}
            />
          </FormField>
        </FormSection>

        <FormActions
          onCancel={() => requestLeave(ADMIN_PATHS.guides.list)}
          submitting={submitting}
          submitLabel={isCreate ? "Publish Guide" : "Save Changes"}
          submittingLabel={isCreate ? "Publishing…" : "Saving…"}
        />
      </form>
      {discardModal}
    </>
  );
}