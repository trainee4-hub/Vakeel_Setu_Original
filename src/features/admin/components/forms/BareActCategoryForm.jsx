import { useMemo, useRef, useState } from "react";
import { createBearerActCategory, updateBearerActCategory } from "../../services/content/bareActsApi";
import { ADMIN_PATHS, scrollToTop } from "../../utils/adminUtils";
import { hasErrors, requireText } from "@shared/utils/formValidation";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import { BackLink } from "@shared/components/ui/Button";
import { FormActions, FormErrorBanner, FormField, FormSection } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";

/* type: "BEARER_ACT" — CREATE { name }, UPDATE { id, name } */
export default function BareActCategoryForm({ mode, initialCategory, onSaved }) {
  const isCreate = mode === "create";
  const toast = useCCToast();
  const initial = useMemo(() => ({ name: initialCategory?.name ?? "" }), [initialCategory]);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  const isDirty = form.name !== initial.name;
  const { requestLeave, discardModal } = useUnsavedChangesGuard(isDirty && !submitting);
  const backTo = `${ADMIN_PATHS.bareActs.list}?tab=categories`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;

    const clientErrors = {};
    requireText(clientErrors, "name", form.name, "Enter a category name.");
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
      const name = form.name.trim();
      const saved = isCreate
        ? await createBearerActCategory({ name })
        : await updateBearerActCategory({ id: initialCategory.id, name });
      toast.success(isCreate ? "Category added." : "Category updated.");
      onSaved?.(saved);
    } catch (error) {
      if (error?.status === 401) return;
      setErrors(error?.fieldErrors ?? {});
      const message = error?.message || "The category could not be saved.";
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
        back={<BackLink label="Back to Bare Acts" onClick={() => requestLeave(backTo)} />}
        title={isCreate ? "Add Bare Act Category" : "Edit Bare Act Category"}
        description="Categories group the Acts shown in the Legal Hub, e.g. Criminal, Civil, Commercial."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormErrorBanner message={formError} />

        <FormSection title="Category">
          <FormField id="category-name" label="Category Name" required error={errors.name}>
            <input
              id="category-name"
              type="text"
              value={form.name}
              onChange={(event) => {
                setForm({ name: event.target.value });
                if (errors.name) setErrors({});
              }}
              disabled={submitting}
              placeholder="Criminal"
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={describedBy("category-name", { error: errors.name })}
              className={fieldClass(errors.name)}
            />
          </FormField>
        </FormSection>

        <FormActions
          onCancel={() => requestLeave(backTo)}
          submitting={submitting}
          submitLabel={isCreate ? "Add Category" : "Save Changes"}
          submittingLabel="Saving…"
        />
      </form>
      {discardModal}
    </>
  );
}
