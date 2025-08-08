import { BlockToolConstructorOptions, MenuConfig, MoveEvent } from '@editorjs/editorjs/types/tools';
import './index.css';
import { API, BlockAPI, BlockToolConstructable, BlockToolData, PasteEvent, SanitizerConfig, type BlockTool } from '@editorjs/editorjs';

type Data = BlockToolData<{
    settings: {
        graspedBlockCount: number;
    },
    title: string;
}>
type Config = {}
/**
 * Create a block for accordion, and it should contain  settings to select the number of following items to be accordioned.
 * in read only the accordion should be expanded by default (depends on settings).
 * the settings should be hidden in the read only mode.
 * styles need to be applied multi block
 */
export default class Accordion implements BlockTool {
    static get toolbox() {
        return {
            title: 'Accordion',
            icon: '<svg>...</svg>'
        };
    }

    wrapper: HTMLElement;
    data: Data;
    api: API
    block: BlockAPI;
    config: Config;
    readonly: boolean;

    constructor({ data, api, block, readOnly, config }: BlockToolConstructorOptions<Data, Config>) {
       
       
       
        const defaultData: Data = {
            settings: {
                graspedBlockCount: 1, // Default to 1 block
            },
            title: '',
        }
        const defaultConfig: Config = {};
        this.data = data || defaultData;
        this.api = api;
        this.block = block;
        this.readonly = readOnly || false;
        this.config = config || defaultConfig;
        this.wrapper = document.createElement('div');

    }


    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('accordion-wrapper');
        const title = document.createElement("div");
        title.setAttribute('contenteditable', 'true');
        this.wrapper.appendChild(title);
        title.addEventListener('input', (event) => {
            this.block.dispatchChange();
        });

        const settings = document.createElement("div");
        settings.classList.add('settings');

        if (!this.readonly)
            this.wrapper.appendChild(settings);

        return this.wrapper;
    }

    save(blockContent: HTMLElement) {
        console.log("🚀 ~ Accordion ~ save ~ blockContent:", blockContent)
        return this.data;
    }
}
