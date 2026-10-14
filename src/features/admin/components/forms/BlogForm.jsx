import { useMemo, useRef, useState } from "react";
import { createBlog, updateBlog } from "../../services/content/blogApi";
import { ADMIN_PATHS, scrollToTop } from "../../utils/adminUtils";
import {
  META_DESCRIPTION_MAX,
  META_TITLE_MAX,
  hasErrors,
  keywordsToInput,
  maxLength,
    parseKeywords,
  requireRichText,
  requireText,
} from "@shared/utils/formValidation";
import { richTextToPlain } from "@shared/utils/richText";
import useUnsavedChangesGuard from "@shared/hooks/useUnsavedChangesGuard";
import { useCCToast } from "@shared/components/ui/toastContext";
import PageHeader from "@shared/components/ui/PageHeader";
import ImageUploadField from "@shared/components/ui/ImageUploadField";
import RichTextEditor from "@shared/components/ui/RichTextEditor";
import { BackLink } from "@shared/components/ui/Button";
import { CharCounter, FormActions, FormErrorBanner, FormField, FormSection } from "@shared/components/ui/FormControls";
import { describedBy, fieldClass } from "@shared/components/ui/styles";

const TEXT_FIELDS = ["heading", "title", "date", "writtenBy", "content", "metaTitle", "metaDescription", "metaKeywords"];

function toDateInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) return String(value).slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function blogToForm(blog) {
  return {
    heading: blog?.heading ?? "",
    title: blog?.title ?? "",
    date: toDateInput(blog?.date),
    writtenBy: blog?.writtenBy ?? "",
    content: blog?.content ?? "",
    metaTitle: blog?.metaTitle ?? "",
    metaDescription: blog?.metaDescription ?? "",
    metaKeywords: keywordsToInput(blog?.metaKeywords),
  };
}

function validate(form, { isCreate, image }) {
  const errors = {};
  if (isCreate && !image) errors.image = "Upload a cover image for the blog.";
  requireText(errors, "heading", form.heading, "Enter a heading or category.");
  requireText(errors, "title", form.title, "Enter the blog title.");
  requireText(errors, "date", form.date, "Choose the publication date.");
  requireText(errors, "writtenBy", form.writtenBy, "Enter the author's name.");
  requireRichText(errors, "content", form.content, "Write the blog content.");
  requireText(errors, "metaTitle", form.metaTitle, "Enter a meta title.");
  maxLength(errors, "metaTitle", form.metaTitle, META_TITLE_MAX, "Meta title");
  requireText(errors, "metaDescription", form.metaDescription, "Enter a meta description.");
  maxLength(errors, "metaDescription", form.metaDescription, META_DESCRIPTION_MAX, "Meta description");
  return errors;
}

/**
 * PUT /blogs/:id and POST /blogs both take the full multipart text payload;
 * metaTitle and metaDescription are required by the backend on update, and
 * sending every text field keeps an update from depending on change detection
 * (a re-normalised date or editor HTML must never silently drop a field).
 * The image is appended ONLY when a new file was chosen, so an unchanged blog
 * keeps its current image.
 */
function buildFormData(form, { image }) {
  const formData = new FormData();

  TEXT_FIELDS.forEach((field) => {
    const value =
      field === "metaKeywords" ? parseKeywords(form.metaKeywords).join(", ") : String(form[field]).trim();
    if (field === "metaKeywords" && !value) return;
    formData.append(field, value);
  });

  if (image) formData.append("image", image);
  return formData;
}

export default function BlogForm({ mode, initialBlog, onSaved }) {
  const isCreate = mode === "create";
  const toast = useCCToast();
  const initial = useMemo(() => blogToForm(initialBlog), [initialBlog]);
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
    const inFlight = useRef(false); // blocks a second POST/PUT/PATCH before re-render

  const isDirty = image !== null || TEXT_FIELDS.some((field) => form[field] !== initial[field]);
  const { requestLeave, discardModal } = useUnsavedChangesGuard(isDirty && !submitting);

    const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const update = (field) => (event) => setField(field, event.target.value);

  const inputProps = (field, hint) => ({
    id: `blog-${field}`,
    value: form[field],
    onChange: update(field),
    disabled: submitting,
    "aria-invalid": Boolean(errors[field]) || undefined,
    "aria-describedby": describedBy(`blog-${field}`, { error: errors[field], hint }),
    className: fieldClass(errors[field]),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
        if (inFlight.current) return;

    const clientErrors = validate(form, { isCreate, image });
    setErrors(clientErrors);
    if (hasErrors(clientErrors)) {
            setFormError("Fix the highlighted fields before saving.");
      scrollToTop();
      return;
    }

       
        inFlight.current = true;
    setFormError(null);
    setSubmitting(true);
    try {
      // const formData = buildFormData(form, initial, { isCreate, image });
            const formData = buildFormData(form, { image });
      const saved = isCreate ? await createBlog(formData) : await updateBlog(initialBlog.id, formData);
      toast.success(isCreate ? "Blog published." : "Blog updated.");
      onSaved?.(saved);
    } catch (error) {
      if (error?.status === 401) return;
      setErrors(error?.fieldErrors ?? {});
            const message = error?.message || "The blog could not be saved.";
      setFormError(message);
      toast.error(message);
      scrollToTop();
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const keywordsHint = "Separate keywords with commas, e.g. bail laws India, bail process, legal rights";

  return (
    <>
      <PageHeader
        back={<BackLink label="Back to Blogs" onClick={() => requestLeave(ADMIN_PATHS.blogs.list)} />}
        title={isCreate ? "Create Blog" : "Edit Blog"}
        description={isCreate ? "Publish a new legal article." : "Update article content and SEO information."}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormErrorBanner message={formError} />

        <FormSection title="Basic Information">
          <ImageUploadField
            label="Blog image"
            required={isCreate}
            file={image}
            onFileChange={(file) => {
              setImage(file);
              if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
            }}
            existingUrl={initialBlog?.image ?? initialBlog?.imageUrl ?? null}
            existingAlt={initialBlog?.title ? `Cover image for ${initialBlog.title}` : "Current cover image"}
            error={errors.image}
            disabled={submitting}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="blog-heading" label="Heading / category" required error={errors.heading}>
              <input type="text" placeholder="Criminal Law" {...inputProps("heading")} />
            </FormField>
            <FormField id="blog-writtenBy" label="Written by" required error={errors.writtenBy}>
              <input type="text" placeholder="Author name" {...inputProps("writtenBy")} />
            </FormField>
          </div>

          <FormField id="blog-title" label="Title" required error={errors.title}>
            <input type="text" placeholder="Understanding Bail Laws in India" {...inputProps("title")} />
          </FormField>

          <FormField id="blog-date" label="Publication date" required error={errors.date}>
            <input type="date" {...inputProps("date")} className={`${fieldClass(errors.date)} sm:max-w-xs`} />
          </FormField>
        </FormSection>

        <FormSection title="Content">
          <FormField
            id="blog-content"
            label="Blog content"
            required
            error={errors.content}
                        counter={<CharCounter value={richTextToPlain(form.content)} />}
          >
            <RichTextEditor
              id="blog-content"
              ariaLabel="Blog content"
              value={form.content}
              onChange={(html) => setField("content", html)}
              placeholder="Write the full article…"
              disabled={submitting}
              invalid={Boolean(errors.content)}
              describedBy={describedBy("blog-content", { error: errors.content })}
            />
          </FormField>
        </FormSection>

        <FormSection title="SEO Settings" description="How this article appears in search results.">
          <FormField
            id="blog-metaTitle"
            label="Meta title"
            required
            error={errors.metaTitle}
            counter={<CharCounter value={form.metaTitle} max={META_TITLE_MAX} />}
          >
            <input type="text" {...inputProps("metaTitle")} />
          </FormField>

          <FormField
            id="blog-metaDescription"
            label="Meta description"
            required
            error={errors.metaDescription}
            counter={<CharCounter value={form.metaDescription} max={META_DESCRIPTION_MAX} />}
          >
            <textarea rows={3} {...inputProps("metaDescription")} />
          </FormField>

          <FormField id="blog-metaKeywords" label="Meta keywords" optional hint={keywordsHint} error={errors.metaKeywords}>
            <input type="text" {...inputProps("metaKeywords", keywordsHint)} />
          </FormField>
        </FormSection>

        <FormActions
          onCancel={() => requestLeave(ADMIN_PATHS.blogs.list)}
          submitting={submitting}
          submitLabel={isCreate ? "Publish Blog" : "Save Changes"}
          submittingLabel={isCreate ? "Publishing…" : "Saving…"}
        />
      </form>
      {discardModal}
    </>
  );
}
