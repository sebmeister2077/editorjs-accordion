import { BlockToolConstructorOptions } from '@editorjs/editorjs/types/tools';
import './index.css';
import { API, BlockAPI, BlockToolData, type BlockTool } from '@editorjs/editorjs';
type Data = BlockToolData<{
    settings: {
        graspedBlockCount: number;
    };
    title: string;
}>;
type Config = {};
/**
 * Create a block for accordion, and it should contain  settings to select the number of following items to be accordioned.
 * in read only the accordion should be expanded by default (depends on settings).
 * the settings should be hidden in the read only mode.
 * styles need to be applied multi block
 */
export default class Accordion implements BlockTool {
    static get toolbox(): {
        title: string;
        icon: string;
    };
    wrapper: HTMLElement;
    data: Data;
    api: API;
    block: BlockAPI;
    config: Config;
    readonly: boolean;
    constructor({ data, api, block, readOnly, config }: BlockToolConstructorOptions<Data, Config>);
    render(): HTMLElement;
    save(blockContent: HTMLElement): {
        settings: {
            graspedBlockCount: number;
        };
        title: string;
    };
}
export {};
