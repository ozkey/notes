import { PluginCommand } from "suneditor/src/interfaces/index.js";
import CoreKernel from "suneditor/src/core/kernel/coreKernel.js";
/**
 * @class
 * @description Blockquote plugin
 */
declare class HelloWorld extends PluginCommand {
    static key: string;
    static className: string;
    private quoteTag;
    /**
     * @constructor
     * @param {SunEditor.Kernel} kernel - The Kernel instance
     */
    constructor(kernel: CoreKernel);
    /**
     * @hook Editor.EventManager
     * @type {SunEditor.Hook.Event.Active}
     */
    active(element: {
        nodeName: string;
    }, target: Node | SunEditor.NodeCollection): boolean;
    /**
     * @override
     * @type {PluginCommand['action']}
     */
    action(): void;
}
export default HelloWorld;
//# sourceMappingURL=EditorPlugin.d.ts.map