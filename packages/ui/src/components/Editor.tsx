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
                ["undo", "redo"],
                "|",
                ["blockStyle", "font", "fontSize"],
                "|",
                ["bold", "italic", "underline", "strike"],
                "|",
                ["fontColor", "backgroundColor"],
                "|",
                ["removeFormat"],
                "/",
                ["outdent", "indent", "align", "list"],
                "|",
                ["table", "link", "image", "video"],
                "|",
                ["fullScreen", "codeView"],
                [
                    "%992",
                    [
                        ["undo", "redo"],
                        "|",
                        [":Format-default.more_paragraph", "blockStyle", "font", "fontSize"],
                        ["bold", "italic", "underline", "strike"],
                        "|",
                        ["fontColor", "backgroundColor"],
                        "|",
                        ["removeFormat"],
                        "|",
                        ["outdent", "indent", "align", "list"],
                        "|",
                        ["table", "link", "image", "video"],
                        "|",
                        ["fullScreen", "codeView"]
                    ]
                ],
                [
                    "%768",
                    [
                        ["undo", "redo"],
                        "|",
                        [":Format-default.more_paragraph", "blockStyle", "font", "fontSize", "|", "removeFormat"],
                        ["bold", "italic", "underline", "strike"],
                        "|",
                        ["fontColor", "backgroundColor"],
                        ["outdent", "indent", "align", "list"],
                        "|",
                        [":Insert-default.more_plus", "table", "link", "image", "video"],
                        "|",
                        ["fullScreen", "codeView"]
                    ]
                ],
                [
                    "%576",
                    [
                        ["undo", "redo"],
                        "|",
                        [":Format-default.more_paragraph", "blockStyle", "font", "fontSize"],
                        [":Text-default.more_text", "bold", "italic", "underline", "strike", "|", "fontColor", "backgroundColor", "|", "removeFormat"],
                        ["outdent", "indent", "align", "list"],
                        "|",
                        [":Insert-default.more_plus", "table", "link", "image", "video"],
                        ["-right", "fullScreen", "codeView"]
                    ]
                ]
            ],
        });

        return () => instance.destroy();
    }, []);

    return <textarea ref={ref} />;
}