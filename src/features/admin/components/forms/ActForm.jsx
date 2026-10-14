import { useCallback, useMemo, useRef, useState } from "react";
import { categoryLabel, createAct, getAllBearerActs, recordId, updateAct } from "../../services/content/bareActsApi";
import { ADMIN_PATHS, scrollToTop } from "../../utils/adminUtils";
import { hasErrors, requireText } from "@shared/utils/formValidation";
import useAsyncOptions from "@shared/hooks/useAsyncOptions";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import { BackLink } from "@shared/components/ui/Button";
import { FormActions, FormErrorBanner, FormField, FormSection } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";

/*
 * type: "ACT"
 *   CREATE { bearerActId, heading, act, year }
 *   UPDATE { id, heading, act, year }   ← the contract has no category move,
 *                                         so the category is read-only on edit
 */
const FIELDS = ["bearerActId", "heading", "act", "year"];

export default function ActForm({ mode, initialAct, defaultCategoryId = "", onSaved }) {
  const isCreate = mode === "create";
  const toast = useCCToast();

  const initial = useMemo(
    () => ({
      bearerActId: String(initialAct?.bearerActId ?? initialAct?.bearerAct?.id ?? defaultCategoryId ?? ""),
      heading: initialAct?.heading ?? "",
      act: initialAct?.act ?? "",
      year: initialAct?.year != null ? String(initialAct.year) : "",
    }),
    [initialAct, defaultCategoryId],
  );

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  const loadCategories = useCallback(() => getAllBearerActs(), []);
  const categories = useAsyncOptions(loadCategories, { enabled: isCreate });

  const isDirty = FIELDS.some((field) => form[field] !== initial[field]);
  const { requestLeave, discardModal } = useUnsavedChangesGuard(isDirty && !submitting);
  const backTo = `${ADMIN_PATHS.bareActs.list}?tab=acts`;

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputProps = (field) => ({
    id: `act-${field}`,
    value: form[field],
    onChange: (event) => setField(field, event.target.value),
    disabled: submitting,
    "aria-invalid": Boolean(errors[field]) || undefined,
    "aria-describedby": describedBy(`act-${field}`, { error: errors[field] }),
    className: fieldClass(errors[field]),
  });

  const validate = () => {
    const next = {};
    if (isCreate) requireText(next, "bearerActId", form.bearerActId, "Choose a category.");
    requireText(next, "heading", form.heading, "Enter the heading.");
    requireText(next, "act", form.act, "Enter the act name.");
    requireText(next, "year", form.year, "Enter the year.");
    if (!next.year && !/^\d{1,4}$/.test(form.year.trim())) next.year = "Year must be a number, e.g. 1860.";
    return next;
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
        saved = await createAct({
          bearerActId: form.bearerActId,
          heading: form.heading.trim(),
          act: form.act.trim(),
          year: Number(form.year.trim()),
        });
      } else {
        // Only changed fields are sent, so untouched values are never overwritten.
        const data = { id: initialAct.id };
        if (form.heading !== initial.heading) data.heading = form.heading.trim();
        if (form.act !== initial.act) data.act = form.act.trim();
        if (form.year !== initial.year) data.year = Number(form.year.trim());
        saved = await updateAct(data);
      }
      toast.success(isCreate ? "Act added." : "Act updated.");
      onSaved?.(saved);
    } catch (error) {
      if (error?.status === 401) return;
      setErrors(error?.fieldErrors ?? {});
      const message = error?.message || "The act could not be saved.";
      setFormError(message);
      toast.error(message);
      scrollToTop();
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const categoryName =
    initialAct?.bearerAct?.name ??
    categories.items.find((category) => String(recordId(category)) === String(form.bearerActId))?.name ??
    "—";

  return (
    <>
      <PageHeader
        back={<BackLink label="Back to Bare Acts" onClick={() => requestLeave(backTo)} />}
        title={isCreate ? "Add Act" : "Edit Act"}
        description={isCreate ? "Add an Act to a Bare Act category." : "Update this Act's heading, name or year."}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormErrorBanner message={formError} />

        <FormSection title="Act">
          {isCreate ? (
            <FormField
              id="act-bearerActId"
              label="Bare Act Category"
              required
              error={errors.bearerActId}
              hint={categories.status === "error" ? "Categories couldn't be loaded. Retry from the Bare Acts page." : undefined}
            >
              <select {...inputProps("bearerActId")} disabled={submitting || categories.status === "loading"}>
                <option value="">
                  {categories.status === "loading" ? "Loading categories…" : "Select a category"}
                </option>
                {categories.items.map((category) => (
                  <option key={recordId(category)} value={recordId(category)}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
            <FormField id="act-category-readonly" label="Bare Act Category" hint="The category can't be changed from this screen.">
              <input id="act-category-readonly" type="text" value={categoryName} readOnly disabled className={fieldClass(false)} />
            </FormField>
          )}

          <FormField id="act-heading" label="Heading" required error={errors.heading}>
            <input type="text" placeholder="Indian Penal Code" {...inputProps("heading")} />
          </FormField>

          <FormField id="act-act" label="Act Name" required error={errors.act}>
            <input type="text" placeholder="Indian Penal Code" {...inputProps("act")} />
          </FormField>

          <FormField id="act-year" label="Year" required error={errors.year}>
            <input type="text" inputMode="numeric" placeholder="1860" {...inputProps("year")} className={`${fieldClass(errors.year)} sm:max-w-[160px]`} />
          </FormField>
        </FormSection>

        <FormActions
          onCancel={() => requestLeave(backTo)}
          submitting={submitting}
          submitLabel={isCreate ? "Add Act" : "Save Changes"}
          submittingLabel="Saving…"
        />
      </form>
      {discardModal}
    </>
  );
}
