import { BlockToolConstructorOptions, MenuConfig, MoveEvent } from '@editorjs/editorjs/types/tools';
import './index.css';
import { API, BlockAPI, BlockToolConstructable, BlockToolData, PasteEvent, SanitizerConfig, type BlockTool } from '@editorjs/editorjs';
import { gearIcon } from './icons';

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
    public static get toolbox() {
        return {
            title: 'Accordion',
            icon: /*html*/`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>`,
        };
    }
    public WRAPPER_ATTRIBUTE_NAME = 'data-accordion-wrapper';
    private wrapper: HTMLElement;
    public data: Data;
    private api: API
    private block: BlockAPI;
    private config: Config;
    private readonly: boolean;

    constructor({ data, api, block, readOnly, config }: BlockToolConstructorOptions<Data, Config>) {



        const defaultData: Data = {
            settings: {
                graspedBlockCount: 1, // Default to 1 block
            },
            title: '',
        }
        const defaultConfig: Config = {};
        this.data = data || defaultData;
        if (!this.data.settings) {
            this.data.settings = defaultData.settings;
        }
        this.api = api;
        this.block = block;
        this.readonly = readOnly || false;
        this.config = config || defaultConfig;
        this.wrapper = document.createElement('div');

    }


    public render() {
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
        settings.setAttribute('type', 'button');
        // settings svg icon
        settings.innerHTML = gearIcon
        settings.addEventListener('click', () => {
            const popover = document.createElement('div');
            popover.classList.add('settings-popover');
            popover.innerHTML = /*html*/`
                <div class="settings-content">
                    <label for="graspedBlockCount">Grasped Block Count:</label>
                    <input type="number" id="graspedBlockCount" value="${this.data.settings?.graspedBlockCount ?? 1}" min="1" max="10">
                    <button type="button" class="save-settings">Save</button>
                </div>
            `;

            const input = popover.querySelector<HTMLInputElement>('#graspedBlockCount');
            const saveButton = popover.querySelector<HTMLButtonElement>('.save-settings');
            if (input && saveButton) {
                input.addEventListener('input', () => {
                    this.data.settings.graspedBlockCount = parseInt(input.value);
                });

                saveButton.addEventListener('click', () => {
                    this.block.dispatchChange();
                    popover.remove();
                });
            }
            function removeListener(event: PointerEvent) {
                if (event.target !== settings && !popover.contains(event.target as Node)) {
                    popover.remove();
                }
                document.removeEventListener('click', removeListener, { capture: true });
            }
            document.addEventListener('click', removeListener, { capture: true });
            settings.insertAdjacentElement('afterend', popover);
        });

        if (!this.readonly)
            this.wrapper.appendChild(settings);

        this.wrapper.setAttribute(this.WRAPPER_ATTRIBUTE_NAME, this.data.settings.graspedBlockCount.toString());
        return this.wrapper;
    }

    public save(blockContent: HTMLElement) {
        console.log("🚀 ~ Accordion ~ save ~ blockContent:", blockContent)
        return this.data;
    }
}
