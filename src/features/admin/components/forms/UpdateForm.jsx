import { useMemo, useRef, useState } from "react";
import { createUpdate, updateUpdate } from "../../services/content/updatesApi";
import { ADMIN_PATHS, scrollToTop } from "../../utils/adminUtils";
import { changedFields, hasErrors, requireRichText, requireText } from "@shared/utils/formValidation";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import { BackLink, Icon } from "@shared/components/ui/Button";
import RichTextEditor from "@shared/components/ui/RichTextEditor";
import { FormActions, FormErrorBanner, FormField, FormSection } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";

const FIELDS = ["title", "oldDescription", "newDescription"];

function validate(form) {
  const errors = {};
  requireText(errors, "title", form.title, "Enter an update title.");
  requireRichText(errors, "oldDescription", form.oldDescription, "Describe the previous position.");
  requireRichText(errors, "newDescription", form.newDescription, "Describe what's new.");
  return errors;
}

export default function UpdateForm({ mode, initialUpdate, onSaved }) {
  const isCreate = mode === "create";
  const toast = useCCToast();
  const initial = useMemo(
    () => ({
      title: initialUpdate?.title ?? "",
      oldDescription: initialUpdate?.oldDescription ?? "",
      newDescription: initialUpdate?.newDescription ?? "",
    }),
    [initialUpdate],
  );
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
    const inFlight = useRef(false); // blocks a second POST/PUT/PATCH before re-render

  const isDirty = FIELDS.some((field) => form[field] !== initial[field]);
  const { requestLeave, discardModal } = useUnsavedChangesGuard(isDirty && !submitting);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const update = (field) => (event) => setField(field, event.target.value);

  const editorProps = (field, ariaLabel) => ({
    id: `update-${field}`,
    ariaLabel,
    size: "md",
    value: form[field],
    onChange: (html) => setField(field, html),
    disabled: submitting,
    invalid: Boolean(errors[field]),
    describedBy: describedBy(`update-${field}`, { error: errors[field] }),
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

    const body = isCreate
      ? {
          title: form.title.trim(),
          oldDescription: form.oldDescription.trim(),
          newDescription: form.newDescription.trim(),
        }
      : changedFields(form, initial, FIELDS);
    if (!isCreate && !Object.keys(body).length) {
      toast.info("No changes to save.");
      return;
    }

        inFlight.current = true;
    setFormError(null);
    setSubmitting(true);
    try {
      const saved = isCreate ? await createUpdate(body) : await updateUpdate(initialUpdate.id, body);
      toast.success(isCreate ? "Update posted." : "Update saved.");
      onSaved?.(saved);
    } catch (error) {
      if (error?.status === 401) return;
      setErrors(error?.fieldErrors ?? {});
      setFormError(error?.message || "The update could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        back={<BackLink label="Back to Updates" onClick={() => requestLeave(ADMIN_PATHS.updates.list)} />}
        title={isCreate ? "Post Update" : "Edit Update"}
        description="Show readers exactly what changed: the previous position next to what's new."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormErrorBanner message={formError} />

        <FormSection title="Update">
          <FormField id="update-title" label="Update title" required error={errors.title}>
            <input
              id="update-title"
              type="text"
              value={form.title}
              onChange={update("title")}
              disabled={submitting}
              placeholder="Updated Legal Consultation Process"
              aria-invalid={Boolean(errors.title) || undefined}
              aria-describedby={describedBy("update-title", { error: errors.title })}
              className={fieldClass(errors.title)}
            />
          </FormField>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Icon name="history" className="text-[20px] text-slate-500" />
                Before
              </div>
              <FormField id="update-oldDescription" label="Previous Position" required error={errors.oldDescription}>
                <RichTextEditor
                  placeholder="Previously, users had to contact advocates manually…"
                  {...editorProps("oldDescription", "Previous position")}
                />
              </FormField>
            </div>

            <div className="min-w-0 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Icon name="new_releases" className="text-[20px] text-amber-600" />
                After
              </div>
              <FormField id="update-newDescription" label="What's New" required error={errors.newDescription}>
                <RichTextEditor
                  placeholder="Users can now book consultations directly…"
                  {...editorProps("newDescription", "What's new")}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormActions
          onCancel={() => requestLeave(ADMIN_PATHS.updates.list)}
          submitting={submitting}
          submitLabel={isCreate ? "Post Update" : "Save Changes"}
          submittingLabel={isCreate ? "Posting…" : "Saving…"}
        />
      </form>
      {discardModal}
    </>
  );
}