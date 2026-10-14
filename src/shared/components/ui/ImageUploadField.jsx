import { useEffect, useId, useRef, useState } from "react";
import { Button, Icon } from "./Button";
import { IMAGE_ACCEPT, validateImageFile } from "../../utils/imageValidation";

/**
 * Image picker: validation (type/size), local preview, replace/remove,
 * and the currently saved image while editing.
 * The preview object URL is created in the change handler and revoked on
 * replace, remove and unmount. Nothing uploads until the form is submitted.
 */
export default function ImageUploadField({
  label,
  required = false,
  optional = false,
  file,
  onFileChange,
  existingUrl,
  existingAlt = "Current image",
  error,
  disabled = false,
  hint = "JPEG, PNG or WEBP, up to 5 MB.",
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const urlRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const replacePreview = (nextFile) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = nextFile ? URL.createObjectURL(nextFile) : null;
    setPreviewUrl(urlRef.current);
  };

  const handleChange = (event) => {
    const picked = event.target.files?.[0] ?? null;
    event.target.value = ""; // allow picking the same file again later
    if (!picked) return;
    const problem = validateImageFile(picked);
    if (problem) {
      setLocalError(problem);
      return;
    }
    setLocalError(null);
    replacePreview(picked);
    onFileChange(picked);
  };

  const removeNewFile = () => {
    setLocalError(null);
    replacePreview(null);
    onFileChange(null);
  };

  const showingNew = Boolean(file && previewUrl);
  const displayUrl = showingNew ? previewUrl : existingUrl || null;
  const shownError = localError || error;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
          {label}
          {required ? (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {optional ? <span className="text-xs text-slate-400">Optional</span> : null}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={Boolean(shownError) || undefined}
        aria-describedby={`${inputId}-help`}
        aria-required={required || undefined}
      />

      {displayUrl ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
          <img
            src={displayUrl}
            alt={showingNew ? `Preview of ${file.name}` : existingAlt}
            className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-44"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate text-sm font-medium text-slate-800">{showingNew ? file.name : "Current image"}</p>
            <p className="text-xs text-slate-500">
              {showingNew
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB · uploads when you save`
                : "Kept unless you choose a replacement."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon="swap_horiz" onClick={() => inputRef.current?.click()} disabled={disabled}>
                Replace
              </Button>
              {showingNew ? (
                <Button variant="ghost" icon="close" onClick={removeNewFile} disabled={disabled}>
                  {existingUrl ? "Keep current image" : "Remove"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            shownError
              ? "border-red-300 bg-red-50/40"
              : "border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/40"
          }`}
        >
          <Icon name="add_photo_alternate" className="text-[30px] text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Upload image</span>
        </button>
      )}

      <p id={`${inputId}-help`} className={`mt-1.5 text-xs ${shownError ? "font-medium text-red-600" : "text-slate-500"}`}>
        {shownError || hint}
      </p>
    </div>
  );
}
