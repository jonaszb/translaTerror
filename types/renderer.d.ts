export interface IElectronAPI {
    openFile: () => Promise<string[]>;
}

export type FileDialogProperties = Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
>;

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
