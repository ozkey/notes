import { interfaces } from "suneditor";
import type { SunEditor } from "suneditor/types";
/**
 * @class
 * @description BibleBookmark — Opens a form to insert Bible book:chapter links as hashes
 */
declare class BibleBookmark extends interfaces.PluginDropdown {
    #private;
    static key: string;
    constructor(kernel: SunEditor.Kernel);
    /** @override @type {PluginDropdown['action']} — Dropdown item click handler */
    action(target: HTMLElement): void;
}
export default BibleBookmark;
//# sourceMappingURL=BibleBookmark.d.ts.map