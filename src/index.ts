import { BlockToolConstructorOptions, MenuConfig, MoveEvent } from '@editorjs/editorjs/types/tools';
import './index.css';
import { API, BlockAPI, BlockToolConstructable, BlockToolData, ConversionConfig, PasteConfig, PasteEvent, SanitizerConfig, ToolboxConfig, ToolConfig, type BlockTool } from '@editorjs/editorjs';
import { accordionIcon, gearIcon } from './icons';
import { IconChevronUp } from '@codexteam/icons';



type Data = BlockToolData<{
    settings: {
        graspedBlockCount: number;
        defaultExpanded?: boolean;
    },
    title: string;
}>
type Config = {
    /**
     * Default value for the accordion to be expanded or not during read mode.
     */
    defaultExpanded: boolean;
    classes?: {
        wrapper?: string;
        settings?: string;
        settingsPopover?: string;
        settingsContent?: string;
    },
    styles?: {
        /**
         * Rules applied to .ce-block[data-readonly] .accordion-wrapper
         */
        blockWrapper?: string;
        /**
         * Rules applied to .ce-block__content when the editor is readonly
        */
        //  full selector: '.ce-block[data-readonly]:where(> .ce-block__content, + .ce-block .ce-block__content , + .ce-block + .ce-block .ce-block__content...)`
        blockContent?: string;
        /**
         * Rules applied to the last block content
         */
        lastBlockContent?: string;
        /**
         * Rules applied to the inside content of the block, like paragraphs, headings, lists, etc.
         * explanatory selector: '.ce-block__content > *'
         */
        insideContent?: string;
    }
}
export default class Accordion implements BlockTool {
    public static get toolbox(): ToolboxConfig {
        return {
            title: 'Accordion',
            icon: accordionIcon
        };
    }
    public static get isReadOnlySupported() {
        return true;
    }
    public static get isInline() {
        return false;
    }
    public static WRAPPER_ATTRIBUTE_NAME = 'data-accordion-wrapper';
    private wrapper: HTMLElement;
    public readonly styleSheetId = 'editorjs-accordion-styles';
    private readonly styleEl: HTMLStyleElement
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
        this.config = { ...defaultConfig, ...(config ?? {}) };
        const defaultData: Data = {
            settings: {
                graspedBlockCount: 3,
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
        this.readonly = readOnly;
        this._opened = Boolean(this.data.settings.defaultExpanded ?? this.config.defaultExpanded);
        this.wrapper = document.createElement('div');

        const styleEl = document.getElementById(this.styleSheetId)
        if (!styleEl) {
            this.styleEl = document.createElement('style');
            this.styleEl.id = this.styleSheetId;
            document.head.appendChild(this.styleEl);
        }
        else
            this.styleEl = styleEl as HTMLStyleElement;

        this.verifyGivenStyles();
    }
    // toolbox?: ToolboxConfig | undefined;
    // pasteConfig?: PasteConfig | undefined;
    // conversionConfig?: ConversionConfig | undefined;
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
    //     // throw new Error('Method not implemented.');
    // }
    validate(blockData: BlockToolData): boolean {
        if (!blockData.settings || typeof blockData.settings.graspedBlockCount !== 'number')
            return false;
        if (blockData.settings.graspedBlockCount < 1)
            return false;
        if (!blockData.title || typeof blockData.title !== 'string')
            return false;

        return true;
    }
    // merge?(blockData: BlockToolData): void {
    //     throw new Error('Method not implemented.');
    // }
    // onPaste?(event: PasteEvent): void {
    //     throw new Error('Method not implemented.');
    // }
    // destroy?(): void {
    //     console.log('Accordion block destroyed');
    // }
    // updated?(): void {
    //     console.log('Accordion block updated');
    // }
    // public removed?(): void {

    // }

    // public moved?(event: MoveEvent): void {
    // }


    public render() {
        this.wrapper = document.createElement('div');
        if (this.readonly)
            this.wrapper.setAttribute("data-readonly", '')
        this.wrapper.classList.add(this.CSS.wrapper);
        const title = document.createElement("div");
        title.setAttribute('contenteditable', this.readonly ? 'false' : 'true');
        title.textContent = this.data.title ?? "";
        this.wrapper.appendChild(title);
        title.addEventListener('input', (event) => {
            if (!(event.target instanceof HTMLDivElement)) return;
            this.data.title = event.target.textContent
            this.block.dispatchChange();
        });

        const settings = document.createElement("div");
        settings.classList.add(this.CSS.settings);
        settings.setAttribute('aria-label', this.api.i18n.t("Settings"));

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
        dropDown.innerHTML = IconChevronUp;

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
        return this.data;
    }

    public get opened() {
        return this._opened;
    }

    public set opened(value: boolean) {
        this._opened = value;
        this.rotateChevronIcon();
    }

    private get EditorCSS() {
        return {
            block: "ce-block",
            block_content: "ce-block__content",
        } as const
    }

    private get CSS() {
        return {
            wrapper: (`accordion-wrapper ` + (this.config.classes?.wrapper || '')).trim(),
            settings: ("accordion-settings " + (this.config.classes?.settings || '')).trim(),
            settingsPopover: ("settings-popover " + (this.config.classes?.settingsPopover || '')).trim(),
            settingsContent: ("settings-content " + (this.config.classes?.settingsContent || '')).trim(),
            saveSettings: ("save-settings " + (this.config.classes?.settingsContent || '')).trim(),
            chevronIcon: "accordion-chevron-icon",
            chevronIconRotated: "accordion-chevron-icon-rotated",
        } as const
    }

    private getBlocks() {
        const blocks: HTMLElement[] = [];
        const blockCount = this.data.settings.graspedBlockCount || 1;

        if (!(this.block.holder.nextElementSibling instanceof HTMLElement)) return [];
        let next = this.block.holder.nextElementSibling;

        for (let i = 0; i < blockCount; i++) {
            blocks.push(next);
            if (!(next.nextElementSibling instanceof HTMLElement)) break;
            const isNextWrapper = next.nextElementSibling.hasAttribute(Accordion.WRAPPER_ATTRIBUTE_NAME);
            if (isNextWrapper) break;
            next = next.nextElementSibling;

        }
        return blocks;
    }

    private renderAccordionBlocks() {
        this.block.holder.setAttribute(Accordion.WRAPPER_ATTRIBUTE_NAME, this.data.settings.graspedBlockCount.toString());
        if (this.readonly)
            this.block.holder.setAttribute("data-readonly", '');
        // create style sheet styles
        const count = this.data.settings.graspedBlockCount || 1;


        const isStylesAlreadyDrawn = this.styleEl.textContent?.includes(`.${this.EditorCSS.block}[${Accordion.WRAPPER_ATTRIBUTE_NAME}="${count}"]`);
        if (isStylesAlreadyDrawn) return;

        let allStyles = '';
        if (this.readonly) {


            const blockRules = `
                display: grid;
                overflow: hidden;
                transition: grid-template-rows .5s;
                -webkit-transition: grid-template-rows .5s;
                -moz-transition: grid-template-rows .5s;
                -ms-transition: grid-template-rows .5s;
                -o-transition: grid-template-rows .5s;
                grid-template-rows: ${this.opened ? 1 : 0}fr;
                ${this.config.styles?.blockWrapper ?? ""}
`;

            const contentRules = `
                min-height: 0;
                width: 650px;
                transition: border .3s, visibility 0.5s;
                -webkit-transition: border .3s, visibility 0.5s;
                -moz-transition: border .3s, visibility 0.5s;
                -ms-transition: border .3s, visibility 0.5s;
                -o-transition: border .3s, visibility 0.5s;
                visibility: ${this.opened ? 'visible' : 'hidden'};
                ${this.config.styles?.blockContent ?? ""}
            `

            const cssBlockStyles = this.generateAccordionSelector(count, blockRules)
            const cssContentStyles = this.generateAccordionSelector(count, contentRules, ` .${this.EditorCSS.block_content}`);

            allStyles += "\n\n/*CSS block, readonly  styles*/\n" + cssBlockStyles;
            allStyles += "\n\n/*CSS block content, readonly styles*/\n" + cssContentStyles;
        }
        else {
            const contentRules = `
                border-left: 1px solid var(--acc-border-color, transparent);
                border-right: 1px solid var(--acc-border-color, transparent);
                transition: border .3s, visibility 0.5s;
                -webkit-transition: border .3s, visibility 0.5s;
                -moz-transition: border .3s, visibility 0.5s;
                -ms-transition: border .3s, visibility 0.5s;
                -o-transition: border .3s, visibility 0.5s;
                min-height: 0;
                /* Because display grid from parent prevents this to use default max width of 650px */
                width: 650px;
                ${this.config.styles?.blockContent ?? ""}
                `;
            const lastContentRules = `
                border-bottom: 1px solid var(--acc-border-color, transparent);
                border-radius: 0 0 15px 15px;
                -webkit-border-radius: 0 0 15px 15px;
                -moz-border-radius: 0 0 15px 15px;
                -ms-border-radius: 0 0 15px 15px;
                -o-border-radius: 0 0 15px 15px;
                ${this.config.styles?.lastBlockContent ?? ""}
                `

            const cssContentStyles = this.generateAccordionSelector(count, contentRules, ` .${this.EditorCSS.block_content}`);
            const lastBlockContentStyles = this.generateAccordtionLastSelector(count, lastContentRules, ` .${this.EditorCSS.block_content}`);

            allStyles += "\n\n/*CSS block content, edit styles*/\n" + cssContentStyles + '\n' + "\n\n/*CSS last blockc ontent, readonly styles*/\n" + lastBlockContentStyles;
        }

        const insideContentElementRules = `
            padding-inline: 80px;
            ${this.config.styles?.insideContent ?? ""}
        `
        const cssInsideContentStyles = this.generateAccordionSelector(count, insideContentElementRules, ` .${this.EditorCSS.block_content} > *`);

        allStyles += cssInsideContentStyles;
        // append styles for the current COUNTa
        this.styleEl.textContent += allStyles;

    }

    private generateAccordionSelector(count: number, rules: string, extraSelector: string = ''): string {
        const parts: string[] = [];

        for (let i = 1; i <= count; i++) {
            const siblingChain = Array(i).fill(`+ .${this.EditorCSS.block}`).join(' ');
            parts.push(`.${this.EditorCSS.block}[${Accordion.WRAPPER_ATTRIBUTE_NAME}="${count}"]:has(.${this.CSS.wrapper}${this.readonly ? "[data-readonly]" : ""}) ${siblingChain}${extraSelector}`);
        }

        const selector = parts.join(',\n');
        return `${selector} { ${rules} }`;
    }

    private generateAccordtionLastSelector(count: number, rules: string, extraSelector: string = ''): string {
        const parts: string[] = [];

        /**
         * Example 
         *  
            first scenario, all blocks exist, and are not another wrapper 
            .ce-block[data-accordion-wrapper="3"]:has(.accordion-wrapper)+.ce-block:not([data-accordion-wrapper])+.ce-block:not([data-accordion-wrapper])+.ce-block:not([data-accordion-wrapper]) .ce-block__content,
            second scenario, only some blocks exist, ant there are not another wrapper, ex accordion at end of editor 
            .ce-block[data-accordion-wrapper="3"]:has(.accordion-wrapper)+.ce-block:not([data-accordion-wrapper])+.ce-block:not([data-accordion-wrapper]):last-child .ce-block__content,
            .ce-block[data-accordion-wrapper="3"]:has(.accordion-wrapper)+.ce-block:not([data-accordion-wrapper]):last-child .ce-block__content,

            third scenario, blocks exist but are cut off by another wrapper 
            .ce-block[data-accordion-wrapper="3"]:has(.accordion-wrapper)+.ce-block:not([data-accordion-wrapper])+.ce-block:not([data-accordion-wrapper]):has(+.ce-block[data-accordion-wrapper]) .ce-block__content,
            .ce-block[data-accordion-wrapper="3"]:has(.accordion-wrapper)+.ce-block:not([data-accordion-wrapper]):has(+.ce-block[data-accordion-wrapper]) .ce-block__content {
                background-color: red;
            }
         */
        const siblingChain = Array(count).fill(`+ .${this.EditorCSS.block}:not([${Accordion.WRAPPER_ATTRIBUTE_NAME}])`).join(' ');
        parts.push(`.${this.EditorCSS.block}[${Accordion.WRAPPER_ATTRIBUTE_NAME}="${count}"]:has(.${this.CSS.wrapper}) ${siblingChain}${extraSelector}`);
        for (let i = count - 1; i > 0; i--) {
            const partialChainWithoutWrapper = Array(i).fill(`+ .${this.EditorCSS.block}:not([${Accordion.WRAPPER_ATTRIBUTE_NAME}])`).join(' ');
            parts.push(`.${this.EditorCSS.block}[${Accordion.WRAPPER_ATTRIBUTE_NAME}="${count}"]:has(.${this.CSS.wrapper}) ${partialChainWithoutWrapper}:last-child${extraSelector}`);
        }

        for (let i = count - 1; i > 0; i--) {
            const partialChainWithWrapper = Array(i).fill(`+ .${this.EditorCSS.block}:not([${Accordion.WRAPPER_ATTRIBUTE_NAME}])`).join(' ');
            parts.push(`.${this.EditorCSS.block}[${Accordion.WRAPPER_ATTRIBUTE_NAME}="${count}"]:has(.${this.CSS.wrapper}) ${partialChainWithWrapper}:has(+ .${this.EditorCSS.block}[${Accordion.WRAPPER_ATTRIBUTE_NAME}])${extraSelector}`);
        }

        const selector = parts.join(',\n');
        return `${selector} { ${rules} }`;
    }

    private toggleAccordion(event: Event) {
        this.opened = !this.opened;
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

    private verifyGivenStyles() {
        const rules = [this.config.styles?.blockWrapper, this.config.styles?.blockContent, this.config.styles?.lastBlockContent, this.config.styles?.insideContent];
        for (const rule of rules) {
            if (rule && !validateCssRules(rule)) {
                console.warn(`Invalid CSS rules provided: '${rule}'. Insert only the css styles`);
                break;
            }
        }

    }
}

function validateCssRules(rules: string): boolean {
    const testElement = document.createElement('div');
    testElement.style.cssText = rules;
    return testElement.style.cssText === rules;
}
function stopPropagation(event: Event) {
    event.stopPropagation();
}
