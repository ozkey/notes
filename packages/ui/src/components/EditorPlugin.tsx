
import { PluginCommand } from 'suneditor/src/interfaces/plugins.js';
import type { SunEditor } from 'suneditor/types';

class HelloWorld extends PluginCommand {
    static key = 'helloWorld';

    constructor(kernel: SunEditor.Kernel) {
        super(kernel);
        this.title = 'Hello World';
        this.icon = '<span style="font-size:14px">HW</span>';
    }

    action(): void {
        this.$.html.insert('<p>Hello, World!</p>');
        this.$.history.push(false);
    }
}

export default HelloWorld;