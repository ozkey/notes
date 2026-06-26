import { useEffect, useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import "jodit/es5/jodit.min.css";
import { BIBLE_BOOKMARK_BUTTON, insertBibleBookmark } from "./BibleBookmark";

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
      controls: {
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
