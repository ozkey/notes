import { PluginCommand } from 'suneditor/src/interfaces/index.js';
import { dom } from 'suneditor/src/helper/index.js';
import CoreKernel from 'suneditor/src/core/kernel/coreKernel.js';


// see
// https://github.com/JiHong88/suneditor/blob/master/src/plugins/command/list_bulleted.js




/**
 * @class
 * @description Blockquote plugin
 */
class HelloWorld extends PluginCommand {
    static key = 'helloWorld';
    static className = '';
    private quoteTag: any;

    /**
     * @constructor
     * @param {SunEditor.Kernel} kernel - The Kernel instance
     */
    constructor(kernel: CoreKernel) {
        super(kernel);
        // plugin basic properties
        this.title = this.$.lang.tag_blockquote;
        this.icon = '<span style="font-size:14px">HW</span>';
        // members
        const el = dom.utils.createElement('div')
        el.className = 'helloWorld';
        this.quoteTag = el

    }

    /**
     * @hook Editor.EventManager
     * @type {SunEditor.Hook.Event.Active}
     */
    active(element: { nodeName: string; }, target: Node | SunEditor.NodeCollection) {
        if (/helloWorld/i.test(element?.nodeName)) {
            dom.utils.addClass(target, 'active');
            return true;
        }

        dom.utils.removeClass(target, 'active');
        return false;
    }

    /**
     * @override
     * @type {PluginCommand['action']}
     */
    action() {
        const currentBlockquote = dom.query.getParentElement(this.$.selection.getNode(), '.helloWorld');

        if (currentBlockquote) {
            // @ts-ignore
            this.$.format.removeBlock(currentBlockquote, { selectedFormats: null, newBlockElement: null, shouldDelete: false, skipHistory: false });
        } else {
            this.$.format.applyBlock(this.quoteTag.cloneNode(true));
        }
    }
}

export default HelloWorld;