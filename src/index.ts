import { BlockToolConstructorOptions, MenuConfig, MoveEvent } from '@editorjs/editorjs/types/tools';
import './index.css';
import { API, BlockAPI, BlockToolConstructable, BlockToolData, ConversionConfig, PasteConfig, PasteEvent, SanitizerConfig, ToolboxConfig, ToolConfig, type BlockTool } from '@editorjs/editorjs';
import { gearIcon } from './icons';
import { IconChevronDown } from '@codexteam/icons';

type Data = BlockToolData<{
    settings: {
        graspedBlockCount: number;
        defaultExpanded?: boolean;
    },
    title: string;
}>
type Config = {
    defaultExpanded: boolean;
}
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
    public static get isReadOnlySupported() {
        return true;
    }
    public WRAPPER_ATTRIBUTE_NAME = 'data-accordion-wrapper';
    private wrapper: HTMLElement;
    public data: Data;
    private api: API
    private block: BlockAPI;
    private config: Config;
    private readonly: boolean;
    private _opened: boolean;

    constructor({ data, api, block, readOnly, config }: BlockToolConstructorOptions<Data, Config>) {



        const defaultConfig: Config = {
            defaultExpanded: true,
        };
        this.config = config || defaultConfig;
        const defaultData: Data = {
            settings: {
                graspedBlockCount: 1,
                defaultExpanded: this.config.defaultExpanded,
            },
            title: '',
        }
        this.data = data || defaultData;
        if (!this.data.settings) {
            this.data.settings = defaultData.settings;
        }
        this.api = api;
        this.block = block;
        this.readonly = readOnly || false;
        this._opened = (this.data.settings.defaultExpanded ?? this.config.defaultExpanded);
        this.wrapper = document.createElement('div');

    }
    // toolbox?: ToolboxConfig | undefined;
    // pasteConfig?: PasteConfig | undefined;
    // conversionConfig?: ConversionConfig | undefined;
    // isReadOnlySupported?: boolean | undefined;
    // isInline?: boolean | undefined;
    // title?: string | undefined;
    // prepare?(data: { toolName: string; config: ToolConfig; }): void | Promise<void> {
    //     throw new Error('Method not implemented.');
    // }
    // reset?(): void | Promise<void> {
    //     throw new Error('Method not implemented.');
    // }
    // sanitize?: SanitizerConfig | undefined;
    // renderSettings?(): HTMLElement | MenuConfig {
    //     throw new Error('Method not implemented.');
    // }
    // validate?(blockData: BlockToolData): boolean {
    //     throw new Error('Method not implemented.');
    // }
    // merge?(blockData: BlockToolData): void {
    //     throw new Error('Method not implemented.');
    // }
    // onPaste?(event: PasteEvent): void {
    //     throw new Error('Method not implemented.');
    // }
    // destroy?(): void {
    //     throw new Error('Method not implemented.');
    // }
    // updated?(): void {
    //     throw new Error('Method not implemented.');
    // }
    // removed?(): void {
    //     throw new Error('Method not implemented.');
    // }
    // moved?(event: MoveEvent): void {
    //     throw new Error('Method not implemented.');
    // }


    public render() {
        this.wrapper = document.createElement('div');
        if (this.readonly)
            this.wrapper.setAttribute("data-readonly", '')
        this.wrapper.classList.add(this.CSS.wrapper);
        const title = document.createElement("div");
        title.setAttribute('contenteditable', this.readonly ? 'false' : 'true');
        title.innerText = this.data.title;
        this.wrapper.appendChild(title);
        title.addEventListener('input', (event) => {
            if (!(event.target instanceof HTMLDivElement)) return;
            this.data.title = event.target.innerText
            this.block.dispatchChange();
        });

        const settings = document.createElement("div");
        settings.classList.add(this.CSS.settings);

        settings.setAttribute('type', 'button');

        settings.innerHTML = gearIcon
        settings.addEventListener('click', () => {
            const popover = document.createElement('div');
            popover.classList.add(this.CSS.settingsPopover);
            popover.innerHTML = /*html*/`
                <div class="${this.CSS.settingsContent}">
                    <label for="graspedBlockCount">Grasped Block Count:</label>
                    <input type="number" id="graspedBlockCount" value="${this.data.settings?.graspedBlockCount ?? 1}" min="1" max="10">
                    <button type="button" class="${this.CSS.saveSettings}">${this.api.i18n.t("Save")}</button>
                </div>
            `;

            const input = popover.querySelector<HTMLInputElement>('#graspedBlockCount');
            const saveButton = popover.querySelector<HTMLButtonElement>('.save-settings');
            if (input && saveButton) {
                input.addEventListener('input', stopPropagation);
                input.addEventListener("keydown", stopPropagation);
                input.addEventListener("keyup", stopPropagation);
                input.addEventListener("keypress", stopPropagation);


                saveButton.addEventListener('click', () => {
                    this.data.settings.graspedBlockCount = parseInt(input.value)
                    this.block.dispatchChange();
                    popover.remove();
                    this.renderAccordionBlocks()

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

        const dropDown = document.createElement('div');
        dropDown.classList.add(this.CSS.chevronIcon);
        dropDown.innerHTML = IconChevronDown;

        if (!this.readonly) {

            this.wrapper.appendChild(settings);
            this.wrapper.removeEventListener("click", this.toggleAccordion.bind(this));
        }
        else {
            this.wrapper.addEventListener("click", this.toggleAccordion.bind(this));
            this.wrapper.appendChild(dropDown)
        }

        return this.wrapper;
    }

    rendered(): void {
        this.renderAccordionBlocks()
        this.opened = this._opened;
    }


    public save(blockContent: HTMLElement) {
        console.log("🚀 ~ Accordion ~ save ~ blockContent:", blockContent)
        return this.data;
    }

    public get opened() {
        return this._opened;
    }

    public set opened(value: boolean) {
        this._opened = value;
        this.drawAccordionBlocks();
        this.rotateChevronIcon();
    }

    private get EditorCSS() {
        return {
            block: "ce-block",
        }
    }

    private get CSS() {
        return {
            wrapper: "accordion-wrapper",
            settings: "accordion-settings",
            settingsPopover: "settings-popover",
            settingsContent: "settings-content",
            saveSettings: "save-settings",
            chevronIcon: "accordion-chevron-icon",
            chevronIconRotated: "accordion-chevron-icon-rotated",
            wrappedBlock: "accordion-wrapped",
            wrappedBlockLast: "accordion-wrapped-last",
            wrappedBlockClosed: "accordion-wrapped-closed",
            wrappedBlockOpened: "accordion-wrapped-opened",
        } as const
    }


    private renderAccordionBlocks() {
        this.block.holder.setAttribute(this.WRAPPER_ATTRIBUTE_NAME, this.data.settings.graspedBlockCount.toString());

        document.querySelectorAll(`.codex-editor__redactor .${this.EditorCSS.block}:has(.${this.CSS.wrapper})`).forEach(block => {
            if (!(block instanceof HTMLElement)) return;
            const count = this.data.settings.graspedBlockCount || 1;
            let next = block;

            while (next && next.classList.contains(this.CSS.wrappedBlock) || next.classList.contains(this.CSS.wrappedBlockLast)) {
                next.classList.remove(this.CSS.wrappedBlock);
                next.classList.remove(this.CSS.wrappedBlockLast);
                next = next.nextElementSibling as HTMLElement;
                if (!next) return;
            }

            next = block;
            for (let i = 0; i < count; i++) {
                if (!(next.nextElementSibling instanceof HTMLElement) || next.nextElementSibling.hasAttribute(this.WRAPPER_ATTRIBUTE_NAME)) {
                    if (this.readonly)
                        next.setAttribute("data-readonly", '')
                    next.classList.remove(this.CSS.wrappedBlock);
                    next.classList.add(this.CSS.wrappedBlockLast);
                    continue;
                }
                next = next.nextElementSibling;
                const isLast = i === count - 1;
                if (!next.classList.contains(this.EditorCSS.block)) break;
                if (this.readonly)
                    next.setAttribute("data-readonly", '')

                if (isLast) {
                    next.classList.add(this.CSS.wrappedBlockLast);
                    next.classList.remove(this.CSS.wrappedBlock);
                }
                else {
                    next.classList.add(this.CSS.wrappedBlock);
                    next.classList.remove(this.CSS.wrappedBlockLast);
                }
            }

        });
    }

    private toggleAccordion(event: Event) {
        this.opened = !this.opened;
    }

    private drawAccordionBlocks() {
        // debugger
        const blocks: HTMLElement[] = [];
        const blockCount = this.data.settings.graspedBlockCount || 1;

        if (!(this.block.holder.nextElementSibling instanceof HTMLElement)) return;
        let next = this.block.holder.nextElementSibling;

        for (let i = 0; i < blockCount; i++) {
            blocks.push(next);
            if (!(next.nextElementSibling instanceof HTMLElement)) break;
            next = next.nextElementSibling;

        }

        blocks.forEach((block, index) => {
            if (this.opened) {
                block.classList.add(this.CSS.wrappedBlockOpened);
                block.classList.remove(this.CSS.wrappedBlockClosed);
            }
            else {
                block.classList.add(this.CSS.wrappedBlockClosed);
                block.classList.remove(this.CSS.wrappedBlockOpened);
            }
        });
    }

    private rotateChevronIcon() {
        const chevronIcon = this.wrapper.querySelector(`.${this.CSS.chevronIcon}`);
        if (!(chevronIcon instanceof HTMLElement)) return;
        if (this.opened) {
            chevronIcon.classList.remove(this.CSS.chevronIconRotated);
        } else {
            chevronIcon.classList.add(this.CSS.chevronIconRotated);
        }
    }
}
function stopPropagation(event: Event) {
    event.stopPropagation();
}