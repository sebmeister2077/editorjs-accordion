import { BlockToolConstructorOptions } from '@editorjs/editorjs/types/tools';
import './index.css';
import { BlockToolData, ToolboxConfig, type BlockTool } from '@editorjs/editorjs';
type Data = BlockToolData<{
    settings: {
        graspedBlockCount: number;
        defaultExpanded?: boolean;
    };
    title: string;
}>;
type Config = {
    defaultExpanded: boolean;
    classes?: {
        wrapper?: string;
        settings?: string;
        settingsPopover?: string;
        settingsContent?: string;
    };
    styles?: {
        blockWrapper?: string;
        blockContent?: string;
        lastBlockContent?: string;
        lastBlockWrapper?: string;
    };
};
/**
 * Create a block for accordion, and it should contain  settings to select the number of following items to be accordioned.
 * in read only the accordion should be expanded by default (depends on settings).
 * the settings should be hidden in the read only mode.
 * styles need to be applied multi block
 */
export default class Accordion implements BlockTool {
    static get toolbox(): ToolboxConfig;
    static get isReadOnlySupported(): boolean;
    static get isInline(): boolean;
    WRAPPER_ATTRIBUTE_NAME: string;
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
            graspedBlockCount: number;
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
}
export {};
