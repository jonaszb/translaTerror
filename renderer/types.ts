export type FileItem = {
    name: string;
    path: string;
    extension: string;
    selected?: boolean;
};

export type DocxData = {
    columns: number;
    tables: number;
    sourceLength: number;
    totalLength: number;
};
