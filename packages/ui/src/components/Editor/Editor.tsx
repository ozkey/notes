import { useEffect, useRef } from "react";
import suneditor, { plugins } from "suneditor";
import "suneditor/css/editor";
import "suneditor/css/contents";
import CalloutBlock from "./CalloutBlock";
import HelloWorld from "./EditorPlugin";

export default function Editor({
  value = "",
  onChange,
}: {
  value?: string;
  onChange?: (html: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    console.log("Initializing editor with value", value);
    const instance = suneditor.create(ref.current!, {
      plugins: { ...plugins, HelloWorld, CalloutBlock },
      value: value || "",
      strictMode: {
        tagFilter: false,
        formatFilter: true,
        classFilter: false,
        textStyleTagFilter: true,
        attrFilter: false,
        styleFilter: false,
      },
      events: {
        // widen type to any to avoid incorrect Event typing from lib
        onSave: async (params: any) => {
          let contents = "";
          if (typeof params === "string") {
            contents = params;
          } else if (params && typeof params.data === "string") {
            contents = params.data;
          } else if (
            editorRef.current &&
            typeof editorRef.current.getContents === "function"
          ) {
            contents = editorRef.current.getContents();
          }
          onChange?.(contents || "");
          console.log(contents);
          return true;
        },
        onChange: (params: {
          $: unknown;
          frameContext: unknown;
          data: string;
        }) => {
          console.log(params.data);
          onChange?.(params.data);
        },
      },
      buttonList: [
        //  "newDocument"
        ["save", "|"],
        ["copy", "selectAll", "|", "outdent", "indent", "align", "list"],
        ["|", "table", "image", "video"],
        ["|", "anchor", "link", "blockquote", "calloutBlock", "helloWorld"],

        ["-right", "codeView", "showBlocks", "fullScreen", "preview", "print"],
        "/",
        ["undo", "redo"],
        "|",
        ["blockStyle", "font", "fontSize"],
        "|",
        [":Format-default.more_paragraph", "blockStyle", "font", "fontSize"],
        ["bold", "italic", "underline", "strike"],
        "|",
        ["fontColor", "backgroundColor"],
        "|",
        ["removeFormat"],
      ],
    });

    editorRef.current = instance;

    return () => instance.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update editor contents when value changes from parent
  // useEffect(() => {
  //   if (editorRef.current) {
  //     try {
  //       console.log("Updating editor contents", value);
  //       editorRef.current.setContents(value + <span>x</span> || "");
  //     } catch (e) {
  //       // ignore
  //     }
  //   }
  // }, [value]);

  return <textarea ref={ref} />;
}
