import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Placeholder } from "@tiptap/extensions";
import { Icon } from "./Button";
import { toEditorHtml } from "../../utils/richText";

/* =========================================================================
   RICH TEXT EDITOR (TipTap) — controlled like an input:

     <RichTextEditor value={form.content} onChange={(html) => …} />

   - value / onChange carry an HTML string ("" when the document is empty)
   - legacy plain-text values are converted to paragraphs on load
   - the editor is created ONCE; outside value changes are applied only when
     they differ from what the editor itself last emitted (no resets/loops)
   ========================================================================= */

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = ["", "12px", "14px", "16px", "18px", "20px", "24px", "30px"];

const BLOCK_TYPES = [
  { label: "Paragraph", value: "0" },
  { label: "Heading 1", value: "1" },
  { label: "Heading 2", value: "2" },
  { label: "Heading 3", value: "3" },
  { label: "Heading 4", value: "4" },
];

const HEIGHTS = {
  md: "min-h-[180px] max-h-[420px]",
  lg: "min-h-[320px] max-h-[65vh]",
};

/** https / http / mailto / tel only; bare domains get https://. null = rejected. */
function normalizeUrl(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  return `https://${value.replace(/^\/+/, "")}`;
}

function buildExtensions(placeholder) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto", "tel"],
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
      },
    }),
    TextStyle,
    FontFamily,
    FontSize,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Subscript,
    Superscript,
    Placeholder.configure({ placeholder }),
  ];
}

function selectToolbarState({ editor }) {
  if (!editor) return null;
  const textStyle = editor.getAttributes("textStyle");
  return {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    strike: editor.isActive("strike"),
    superscript: editor.isActive("superscript"),
    subscript: editor.isActive("subscript"),
    code: editor.isActive("code"),
    codeBlock: editor.isActive("codeBlock"),
    blockquote: editor.isActive("blockquote"),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    link: editor.isActive("link"),
    heading: String([1, 2, 3, 4].find((level) => editor.isActive("heading", { level })) ?? 0),
    align: ["center", "right", "justify"].find((align) => editor.isActive({ textAlign: align })) ?? "left",
    fontFamily: textStyle.fontFamily ?? "",
    fontSize: textStyle.fontSize ?? "",
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

export default function RichTextEditor({
  id,
  value = "",
  onChange,
  placeholder = "Write content…",
  disabled = false,
  invalid = false,
  describedBy,
  ariaLabel,
  size = "lg",
}) {
  const fallbackId = useId();
  const editorId = id || `rte-${fallbackId}`;
  const onChangeRef = useRef(onChange);
  const lastEmitted = useRef(value ?? "");

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const extensions = useMemo(() => buildExtensions(placeholder), [placeholder]);

  const editor = useEditor({
    extensions,
    content: toEditorHtml(value ?? ""),
    editable: !disabled,
    editorProps: {
      attributes: {
        id: editorId,
        role: "textbox",
        "aria-multiline": "true",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
        class: `vs-rich-content ${HEIGHTS[size] ?? HEIGHTS.lg} overflow-y-auto px-4 py-3 text-sm leading-7 text-slate-800 focus:outline-none`,
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.isEmpty ? "" : instance.getHTML();
      lastEmitted.current = html;
      onChangeRef.current?.(html);
    },
  });

  // Apply genuinely external value changes (e.g. a form reset) without looping.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = value ?? "";
    if (next === lastEmitted.current) return;
    lastEmitted.current = next;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (next !== current) editor.commands.setContent(toEditorHtml(next), { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.isEditable === disabled) {
      editor.setEditable(!disabled, false);
    }
  }, [editor, disabled]);

  const state = useEditorState({ editor, selector: selectToolbarState });

  /* ------------------------------ LINKS ------------------------------ */

  const [linkDraft, setLinkDraft] = useState(null); // null = panel closed
  const [linkError, setLinkError] = useState(null);

  const openLinkPanel = () => {
    setLinkError(null);
    setLinkDraft(editor?.getAttributes("link").href ?? "");
  };

  const closeLinkPanel = () => {
    setLinkDraft(null);
    setLinkError(null);
    editor?.commands.focus();
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDraft(null);
    setLinkError(null);
  };

  const applyLink = () => {
    if (!editor) return;
    const href = normalizeUrl(linkDraft);
    if (href === null) {
      setLinkError("Only web (https), email (mailto:) or phone (tel:) links are allowed.");
      return;
    }
    if (!href) {
      removeLink();
      return;
    }
    const { empty } = editor.state.selection;
    if (empty && !editor.isActive("link")) {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkDraft(null);
    setLinkError(null);
  };

  /* ----------------------------- TOOLBAR ----------------------------- */

  const run = (command) => () => {
    if (!editor || disabled) return;
    command(editor.chain().focus()).run();
  };

  const setBlockType = (event) => {
    const level = Number(event.target.value);
    if (!editor) return;
    if (level) editor.chain().focus().toggleHeading({ level }).run();
    else editor.chain().focus().setParagraph().run();
  };

  const setFontFamily = (event) => {
    if (!editor) return;
    const family = event.target.value;
    if (family) editor.chain().focus().setFontFamily(family).run();
    else editor.chain().focus().unsetFontFamily().run();
  };

  const setFontSize = (event) => {
    if (!editor) return;
    const size = event.target.value;
    if (size) editor.chain().focus().setFontSize(size).run();
    else editor.chain().focus().unsetFontSize().run();
  };

  const s = state ?? {};

  return (
    <div
      className={`vs-rich-editor overflow-hidden rounded-xl border bg-white shadow-sm transition focus-within:ring-4 ${
        invalid
          ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10"
          : "border-slate-200 focus-within:border-amber-400 focus-within:ring-amber-500/10"
      } ${disabled ? "opacity-70" : ""}`}
    >
      <div
        role="toolbar"
        aria-label="Formatting"
        aria-controls={editorId}
        className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5"
      >
        <ToolbarSelect label="Text style" value={s.heading ?? "0"} onChange={setBlockType} disabled={disabled}>
          {BLOCK_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect label="Font family" value={s.fontFamily ?? ""} onChange={setFontFamily} disabled={disabled}>
          {FONT_FAMILIES.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
          {s.fontFamily && !FONT_FAMILIES.some((font) => font.value === s.fontFamily) ? (
            <option value={s.fontFamily}>Custom</option>
          ) : null}
        </ToolbarSelect>

        <ToolbarSelect label="Font size" value={s.fontSize ?? ""} onChange={setFontSize} disabled={disabled} narrow>
          {FONT_SIZES.map((size) => (
            <option key={size || "default"} value={size}>
              {size ? size.replace("px", "") : "Size"}
            </option>
          ))}
          {s.fontSize && !FONT_SIZES.includes(s.fontSize) ? <option value={s.fontSize}>{s.fontSize}</option> : null}
        </ToolbarSelect>

        <Divider />

        <ToolButton icon="format_bold" label="Bold (Ctrl+B)" active={s.bold} onClick={run((c) => c.toggleBold())} disabled={disabled} />
        <ToolButton icon="format_italic" label="Italic (Ctrl+I)" active={s.italic} onClick={run((c) => c.toggleItalic())} disabled={disabled} />
        <ToolButton icon="format_underlined" label="Underline (Ctrl+U)" active={s.underline} onClick={run((c) => c.toggleUnderline())} disabled={disabled} />
        <ToolButton icon="strikethrough_s" label="Strikethrough" active={s.strike} onClick={run((c) => c.toggleStrike())} disabled={disabled} />
        <ToolButton icon="superscript" label="Superscript" active={s.superscript} onClick={run((c) => c.toggleSuperscript())} disabled={disabled} />
        <ToolButton icon="subscript" label="Subscript" active={s.subscript} onClick={run((c) => c.toggleSubscript())} disabled={disabled} />

        <Divider />

        <ToolButton icon="format_list_bulleted" label="Bullet list" active={s.bulletList} onClick={run((c) => c.toggleBulletList())} disabled={disabled} />
        <ToolButton icon="format_list_numbered" label="Numbered list" active={s.orderedList} onClick={run((c) => c.toggleOrderedList())} disabled={disabled} />

        <Divider />

        <ToolButton icon="format_align_left" label="Align left" active={s.align === "left"} onClick={run((c) => c.setTextAlign("left"))} disabled={disabled} />
        <ToolButton icon="format_align_center" label="Align center" active={s.align === "center"} onClick={run((c) => c.setTextAlign("center"))} disabled={disabled} />
        <ToolButton icon="format_align_right" label="Align right" active={s.align === "right"} onClick={run((c) => c.setTextAlign("right"))} disabled={disabled} />
        <ToolButton icon="format_align_justify" label="Justify" active={s.align === "justify"} onClick={run((c) => c.setTextAlign("justify"))} disabled={disabled} />

        <Divider />

        <ToolButton icon="format_quote" label="Blockquote" active={s.blockquote} onClick={run((c) => c.toggleBlockquote())} disabled={disabled} />
        <ToolButton icon="code" label="Inline code" active={s.code} onClick={run((c) => c.toggleCode())} disabled={disabled} />
        <ToolButton icon="data_object" label="Code block" active={s.codeBlock} onClick={run((c) => c.toggleCodeBlock())} disabled={disabled} />
        <ToolButton icon="horizontal_rule" label="Horizontal line" onClick={run((c) => c.setHorizontalRule())} disabled={disabled} />
        <ToolButton icon="link" label={s.link ? "Edit link" : "Add link"} active={s.link || linkDraft !== null} onClick={openLinkPanel} disabled={disabled} />
        <ToolButton icon="link_off" label="Remove link" onClick={removeLink} disabled={disabled || !s.link} />

        <Divider />

        <ToolButton icon="format_clear" label="Clear formatting" onClick={run((c) => c.unsetAllMarks().clearNodes().unsetTextAlign())} disabled={disabled} />
        <ToolButton icon="undo" label="Undo (Ctrl+Z)" onClick={run((c) => c.undo())} disabled={disabled || !s.canUndo} />
        <ToolButton icon="redo" label="Redo (Ctrl+Shift+Z)" onClick={run((c) => c.redo())} disabled={disabled || !s.canRedo} />
      </div>

      {linkDraft !== null ? (
        <div className="border-b border-slate-200 bg-white px-3 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor={`${editorId}-link`} className="text-xs font-semibold text-slate-600">
              Link URL
            </label>
            <input
              id={`${editorId}-link`}
              type="url"
              value={linkDraft}
              onChange={(event) => setLinkDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  closeLinkPanel();
                }
              }}
              placeholder="https://example.com"
              autoFocus
              className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10"
            />
            <div className="flex gap-2">
              <button type="button" onClick={applyLink} className="h-9 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-600">
                Apply
              </button>
              {s.link ? (
                <button type="button" onClick={removeLink} className="h-9 rounded-lg px-3 text-xs font-semibold text-red-600 hover:bg-red-50">
                  Remove
                </button>
              ) : null}
              <button type="button" onClick={closeLinkPanel} className="h-9 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </div>
          {linkError ? <p className="mt-1.5 text-xs font-medium text-red-600">{linkError}</p> : null}
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}

/* ------------------------------ PIECES ------------------------------ */

function ToolButton({ icon, label, active = false, onClick, disabled = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()} // keep the text selection
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
    >
      <Icon name={icon} className="text-[20px]" />
    </button>
  );
}

function ToolbarSelect({ label, value, onChange, disabled, narrow = false, children }) {
  return (
    <select
      aria-label={label}
      title={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 ${
        narrow ? "w-[72px]" : "max-w-[140px]"
      }`}
    >
      {children}
    </select>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-slate-200" />;
}