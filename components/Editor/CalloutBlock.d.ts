import { interfaces } from "suneditor";
import type { SunEditor } from "suneditor/types";
/**
 * @class
 * @description PluginDropdown — Button opens a menu, item click calls action().
 * Pattern: align, font, blockStyle, lineHeight
 */
declare class CalloutBlock extends interfaces.PluginDropdown {
    static key: string;
    constructor(kernel: SunEditor.Kernel);
    /** @override — Highlight current style in dropdown when opened */
    on(): void;
    /** @override @type {PluginDropdown['action']} — Required: clicked item handler */
    action(target: HTMLElement): void;
}
export default CalloutBlock;
//# sourceMappingURL=CalloutBlock.d.ts.map