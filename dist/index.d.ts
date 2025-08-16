import { BlockToolConstructorOptions } from '@editorjs/editorjs/types/tools';
import './index.css';
import { BlockToolData, ToolboxConfig, type BlockTool } from '@editorjs/editorjs';
type Data = BlockToolData<{
    settings: {
        blockCount: number;
        defaultExpanded?: boolean;
    };
    title: string;
}>;
type Config = {
    /**
     * Default value for the accordion to be expanded or not during read mode.
     */
    defaultExpanded: boolean;
    overrides?: {
        classes?: {
            wrapper?: string;
            title?: string;
            settings?: string;
            settingsPopover?: string;
            settingsContent?: string;
            settingsBlockConfig?: string;
            settingsCheckbox?: string;
            settingsDelimiter?: string;
        };
        styles?: {
            /**
             * Rules applied to .ce-block[data-readonly] .accordion-wrapper
             */
            blockWrapper?: string;
            /**
             * Rules applied to .ce-block__content when the editor is readonly
            */
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
        };
        settingsIcon?: HTMLElement;
    };
    disableAnimation?: boolean;
    /**
     * The max allowed block count
     * @default 10
     */
    maxBlockCount?: number;
};
export default class Accordion implements BlockTool {
    static get toolbox(): ToolboxConfig;
    static get isReadOnlySupported(): boolean;
    static get isInline(): boolean;
    static WRAPPER_ATTRIBUTE_NAME: "data-accordion-wrapper";
    CSSOpenVariableName: string;
    private wrapper;
    readonly styleSheetId = "editorjs-accordion-styles";
    private readonly styleEl;
    data: Data;
    private api;
    private block;
    private config;
    private readonly;
    private _opened;
    constructor({ data, api, block, readOnly, config }: BlockToolConstructorOptions<Data, Config>);
    validate(blockData: BlockToolData): boolean;
    render(): HTMLElement;
    rendered(): void;
    save(blockContent: HTMLElement): {
        settings: {
            blockCount: number;
            defaultExpanded?: boolean;
        };
        title: string;
    };
    get opened(): boolean;
    set opened(value: boolean);
    private get EditorCSS();
    private get CSS();
    private getBlocks;
    private renderAccordionBlocks;
    private generateAccordionSelector;
    private generateAccordtionLastSelector;
    private toggleAccordion;
    private rotateChevronIcon;
    private verifyGivenStyles;
}
export {};
