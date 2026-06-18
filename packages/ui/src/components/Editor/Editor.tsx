import { useEffect, useRef } from "react";
import suneditor, { plugins } from "suneditor";
import "suneditor/css/editor";
import "suneditor/css/contents";
import CalloutBlock from "./CalloutBlock";
import HelloWorld from "./EditorPlugin";
import BibleBookmark from "./BibleBookmark";

export default function Editor({
  value = "",
  refreshNotesDate,
  onChange,
}: {
  value?: string;
  refreshNotesDate?: Date;
  onChange?: (html: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const smallScreen = window.innerWidth < 900;
    if (smallScreen)
      console.log("small screen detected, editor will be disabled");

    console.log("Initializing editor with value", value);
    const instance = suneditor.create(ref.current!, {
      plugins: { ...plugins, HelloWorld, CalloutBlock, BibleBookmark },
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
        // onSave: async (params: any) => {
        //   let contents = "";
        //   if (typeof params === "string") {
        //     contents = params;
        //   } else if (params && typeof params.data === "string") {
        //     contents = params.data;
        //   } else if (
        //     editorRef.current &&
        //     typeof editorRef.current.getContents === "function"
        //   ) {
        //     contents = editorRef.current.getContents();
        //   }
        //
        //   onSave?.(contents || "");
        //   console.log(contents);
        //   return true;
        // },
        onChange: (params: {
          $: unknown;
          frameContext: unknown;
          data: string;
        }) => {
          console.log(params.data);
          onChange?.(params.data);
        },
      },
      buttonList: smallScreen
        ? [
            ["bold", "italic", "underline", "strike"],
            "/",
            ["blockStyle", "font", "fontSize"],
          ]
        : [
            //  "newDocument"
            // ["save", "|"],

            ["undo", "redo"],
            "|",

            "|",
            [
              ":Format-default.more_paragraph",
              "blockStyle",
              "font",
              "fontSize",
            ],
            ["blockStyle"],
            [
              ":Text-default.more_text",
              "bold",
              "italic",
              "underline",
              "strike",
              "|",
              "fontColor",
              "backgroundColor",
              "|",
              "removeFormat",
            ],
            ["bold", "italic", "underline", "removeFormat"],

            [
              "-right",
              ":i-more",
              "showBlocks",
              "codeView",
              "preview",
              "print",
              "fullScreen",
            ],

            "/",

            ["outdent", "indent", "align", "list"],

            [
              "|",
              ":Insert-default.more_plus",
              "table",
              "anchor",
              // "link",
              "image",
              "video",
            ],

            [
              "-right",
              "BibleBookmark",
              "link",
              "blockquote",
              "calloutBlock",
              "helloWorld",
            ],
          ],
    });

    editorRef.current = instance;

    return () => instance.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNotesDate]);

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
