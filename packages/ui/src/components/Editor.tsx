import { useEffect, useRef } from "react";
import suneditor, { plugins } from "suneditor";
import "suneditor/css/editor";
import "suneditor/css/contents";

export default function Editor() {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const instance = suneditor.create(ref.current!, {
            plugins,
            value: "<p>Hello SunEditor</p>",
            buttonList: [
//  "newDocument"
                ["save", "|"],
                [  "copy" ,"selectAll" , "|", "outdent", "indent", "align", "list"],
                ["|","table", "image", "video"],
                ["|","blockquote", "anchor", "link"],

                ["-right", "codeView", "showBlocks","fullScreen", "preview", "print"],
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
                "/",
                ["blockquote", "anchor", "link"],


            ],
        });
        return () => instance.destroy();
    }, []);

    return <textarea ref={ref} />;
}