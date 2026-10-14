import { useMemo, useRef, useState } from "react";
import {
  createUserRight,
  updateUserRight,
} from "../../services/content/userRightsApi";
import {
  ADMIN_PATHS,
  scrollToTop,
} from "../../utils/adminUtils";
import {
  USER_RIGHT_TITLE_MAX,
  changedFields,
  hasErrors,
  maxLength,
  requireRichText,
  requireText,
} from "@shared/utils/formValidation";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import ImageUploadField from "@shared/components/ui/ImageUploadField";
import RichTextEditor from "@shared/components/ui/RichTextEditor";
import { BackLink } from "@shared/components/ui/Button";
import {
  CharCounter,
  FormActions,
  FormErrorBanner,
  FormField,
  FormSection,
} from "@shared/components/ui/FormControls";
import {
  describedBy,
  fieldClass,
} from "@shared/components/ui/styles";

const FIELDS = ["title", "description"];

/* -------------------------------------------------------------------------- */
/*                                  VALIDATION                                */
/* -------------------------------------------------------------------------- */

function validate(form) {
  const errors = {};

  requireText(
    errors,
    "title",
    form.title,
    "Enter a title.",
  );

  maxLength(
    errors,
    "title",
    form.title,
    USER_RIGHT_TITLE_MAX,
    "Title",
  );

  requireRichText(
    errors,
    "description",
    form.description,
    "Enter a description.",
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/*                                BUILD PAYLOAD                               */
/* -------------------------------------------------------------------------- */

/**
 * Uses FormData when a photo is attached.
 * Otherwise sends JSON.
 *
 * Edit mode sends only changed fields.
 */
function buildPayload(
  form,
  initial,
  { isCreate, photo },
) {
  const fields = isCreate
    ? {
        title: form.title.trim(),
        description: form.description.trim(),
      }
    : changedFields(
        form,
        initial,
        FIELDS,
      );

  if (!photo) {
    return fields;
  }

  const formData = new FormData();

  Object.entries(fields).forEach(
    ([key, value]) => {
      formData.append(key, value);
    },
  );

  formData.append("photo", photo);

  return formData;
}

/* -------------------------------------------------------------------------- */
/*                              USER RIGHT FORM                               */
/* -------------------------------------------------------------------------- */

export default function UserRightForm({
  mode,
  initialRight,
  onSaved,
}) {
  const isCreate = mode === "create";
  const toast = useCCToast();

  /* ------------------------------------------------------------------------ */
  /*                              INITIAL VALUES                              */
  /* ------------------------------------------------------------------------ */

  const initial = useMemo(
    () => ({
      title: initialRight?.title ?? "",
      description:
        initialRight?.description ?? "",
    }),
    [initialRight],
  );

  /* ------------------------------------------------------------------------ */
  /*                                  STATE                                   */
  /* ------------------------------------------------------------------------ */

  const [form, setForm] =
    useState(initial);

  const [photo, setPhoto] =
    useState(null);

  const [errors, setErrors] =
    useState({});

  const [formError, setFormError] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  /**
   * Prevents duplicate POST/PUT/PATCH calls before React
   * gets a chance to re-render and disable the submit button.
   */
  const inFlight = useRef(false);

  /* ------------------------------------------------------------------------ */
  /*                              DIRTY CHECK                                 */
  /* ------------------------------------------------------------------------ */

  const isDirty =
    photo !== null ||
    FIELDS.some(
      (field) =>
        form[field] !== initial[field],
    );

  const {
    requestLeave,
    discardModal,
  } = useUnsavedChangesGuard(
    isDirty && !submitting,
  );

  /* ------------------------------------------------------------------------ */
  /*                            FIELD UPDATES                                 */
  /* ------------------------------------------------------------------------ */

  /**
   * Used by components that return their value directly,
   * such as RichTextEditor.
   */
  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear this field's validation error as soon
    // as the user changes the value.
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return {
        ...prev,
        [field]: undefined,
      };
    });

    // Clear general form error after user starts correcting input.
    setFormError((prev) =>
      prev ? null : prev,
    );
  };

  /**
   * Adapter for native inputs where the value comes
   * from event.target.value.
   */
  const update =
    (field) => (event) => {
      setField(
        field,
        event.target.value,
      );
    };

  /* ------------------------------------------------------------------------ */
  /*                                SUBMIT                                    */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    // Prevent accidental double submit.
    if (inFlight.current) {
      return;
    }

    const clientErrors =
      validate(form);

    setErrors(clientErrors);

    if (hasErrors(clientErrors)) {
      setFormError(
        "Fix the highlighted fields before saving.",
      );

      scrollToTop();
      return;
    }

    const payload = buildPayload(
      form,
      initial,
      {
        isCreate,
        photo,
      },
    );

    /**
     * In edit mode, if there is no new photo and none
     * of the editable fields changed, don't make an API call.
     */
    if (
      !isCreate &&
      !(payload instanceof FormData) &&
      !Object.keys(payload).length
    ) {
      toast.info(
        "No changes to save.",
      );
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setFormError(null);

    try {
      const saved = isCreate
        ? await createUserRight(
            payload,
          )
        : await updateUserRight(
            initialRight.id,
            payload,
          );

      toast.success(
        isCreate
          ? "User right added."
          : "User right updated.",
      );

      onSaved?.(saved);
    } catch (error) {
      /**
       * Existing authentication layer handles 401.
       */
      if (error?.status === 401) {
        return;
      }

      setErrors(
        error?.fieldErrors ?? {},
      );

      setFormError(
        error?.message ||
          "The user right could not be saved.",
      );

      scrollToTop();
    } finally {
      /**
       * IMPORTANT:
       * Reset both locks so another save can happen.
       */
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <PageHeader
        back={
          <BackLink
            label="Back to User Rights"
            onClick={() =>
              requestLeave(
                ADMIN_PATHS.userRights.list,
              )
            }
          />
        }
        title={
          isCreate
            ? "Add User Right"
            : "Edit User Right"
        }
        description={
          isCreate
            ? "Explain a legal right in plain language."
            : "Update this right's explanation or photo."
        }
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
      >
        <FormErrorBanner
          message={formError}
        />

        <FormSection title="User Right">
          {/* Title */}
          <FormField
            id="right-title"
            label="Title"
            required
            error={errors.title}
            counter={
              <CharCounter
                value={form.title}
                max={
                  USER_RIGHT_TITLE_MAX
                }
              />
            }
          >
            <input
              id="right-title"
              type="text"
              value={form.title}
              onChange={update("title")}
              disabled={submitting}
              placeholder="Right to Free Legal Aid"
              aria-invalid={
                Boolean(errors.title) ||
                undefined
              }
              aria-describedby={describedBy(
                "right-title",
                {
                  error:
                    errors.title,
                },
              )}
              className={fieldClass(
                errors.title,
              )}
            />
          </FormField>

          {/* Description */}
          <FormField
            id="right-description"
            label="Description"
            required
            error={errors.description}
          >
            <RichTextEditor
              id="right-description"
              ariaLabel="User right description"
              value={
                form.description
              }
              onChange={(html) =>
                setField(
                  "description",
                  html,
                )
              }
              placeholder="Explain the right, who it applies to and how to use it…"
              disabled={submitting}
              invalid={Boolean(
                errors.description,
              )}
              describedBy={describedBy(
                "right-description",
                {
                  error:
                    errors.description,
                },
              )}
            />
          </FormField>

          {/* Photo */}
          <ImageUploadField
            label="Photo"
            optional
            file={photo}
            onFileChange={(file) => {
              setPhoto(file);

              setErrors((prev) => {
                if (!prev.photo) {
                  return prev;
                }

                return {
                  ...prev,
                  photo: undefined,
                };
              });

              setFormError(
                (prev) =>
                  prev
                    ? null
                    : prev,
              );
            }}
            existingUrl={
              initialRight?.photo ??
              null
            }
            existingAlt={
              initialRight?.title
                ? `Photo for ${initialRight.title}`
                : "Current photo"
            }
            error={errors.photo}
            disabled={submitting}
            hint={
              isCreate
                ? "JPEG, JPG, PNG or WEBP, up to 5 MB."
                : "JPEG, JPG, PNG or WEBP, up to 5 MB. A new photo replaces the current one."
            }
          />
        </FormSection>

        <FormActions
          onCancel={() =>
            requestLeave(
              ADMIN_PATHS.userRights.list,
            )
          }
          submitting={submitting}
          submitLabel={
            isCreate
              ? "Add User Right"
              : "Save Changes"
          }
          submittingLabel="Saving…"
        />
      </form>

      {discardModal}
    </>
  );
}