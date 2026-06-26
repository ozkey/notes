import { useEffect, useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import "jodit/es5/jodit.min.css";
import { BIBLE_BOOKMARK_BUTTON, insertBibleBookmark } from "./BibleBookmark";

const canOpenLinkHref = (href: string): boolean => {
  const value = href.trim();
  if (!value) return false;
  if (/^(javascript:|data:|vbscript:)/i.test(value)) return false;
  return /^(https?:|mailto:|tel:|#|\/|\?)/i.test(value);
};

type JoditLikeEditor = {
  s?: { current?: () => Node | null };
  editor?: Element | null;
};

const resolveAnchor = (
  editor: JoditLikeEditor | unknown,
  current: unknown,
): HTMLAnchorElement | null => {
  const currentNode = current instanceof Node ? current : null;
  if (currentNode?.nodeType === Node.ELEMENT_NODE) {
    const anchor = (currentNode as Element).closest("a");
    if (anchor instanceof HTMLAnchorElement) return anchor;
  }

  const editorLike =
    editor && typeof editor === "object" ? (editor as JoditLikeEditor) : null;
  const selectedNode = editorLike?.s?.current?.();
  if (selectedNode?.nodeType === Node.ELEMENT_NODE) {
    const anchor = (selectedNode as Element).closest("a");
    if (anchor instanceof HTMLAnchorElement) return anchor;
  }

  return null;
};

const openEditorLink = (editor: unknown, current: unknown): void => {
  const anchor = resolveAnchor(editor, current);
  const href = anchor?.getAttribute("href") || "";
  if (!canOpenLinkHref(href)) return;

  if (href.startsWith("#")) {
    window.location.hash = href.slice(1);
    return;
  }

  window.open(href, "_blank", "noopener,noreferrer");
};

export default function Editor({
  value = "",
  refreshNotesDate: _refreshNotesDate,
  onChange,
}: {
  value?: string;
  refreshNotesDate?: Date;
  onChange?: (html: string) => void;
}) {
  const [content, setContent] = useState(value || "");

  useEffect(() => {
    setContent(value || "");
  }, [value]);

  const config = useMemo(
    () => ({
      readonly: false,
      height: 420,
      toolbarAdaptive: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      popup: {
        a: [
          {
            name: "eye",
            tooltip: "Open link",
            exec: (editor: unknown, current: unknown) => {
              openEditorLink(editor, current);
            },
          },
          "link",
          "unlink",
          "brush",
          "file",
        ],
      },
      controls: {
        eye: {
          tooltip: "Open link",
          exec: (editor: unknown, current: unknown) => {
            openEditorLink(editor, current);
          },
        },
        [BIBLE_BOOKMARK_BUTTON]: {
          tooltip: "Bible Bookmark",
          text: "🔖",
          exec: (editor: { s?: { insertHTML?: (html: string) => void } }) => {
            insertBibleBookmark(editor);
          },
        },
      },
      buttons: [
        "undo",
        "redo",
        "|",
        "paragraph",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "link",
        "image",
        "table",
        "video",
        "source",
        BIBLE_BOOKMARK_BUTTON,
      ],
      buttonsMD: [
        "undo",
        "redo",
        "|",
        "paragraph",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "link",
        "image",
        "table",
        "video",
        "source",
        BIBLE_BOOKMARK_BUTTON,
      ],
      buttonsSM: [
        "undo",
        "redo",
        "|",
        "paragraph",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "image",
        "table",
        BIBLE_BOOKMARK_BUTTON,
        "source",
      ],
      buttonsXS: [
        "undo",
        "redo",
        "|",
        "paragraph",
        "|",
        "bold",
        "italic",
        "underline",
        "link",
        "image",
        BIBLE_BOOKMARK_BUTTON,
      ],
    }),
    [],
  );

  return (
    <JoditEditor
      value={content}
      config={config}
      onChange={(html) => {
        setContent(html);
        onChange?.(html);
      }}
    />
  );
}
