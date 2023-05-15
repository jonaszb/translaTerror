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

export type EventDataWithLink = {
    eventId: string;
    status: number;
    downloadData: {
        downloaded: boolean;
        url: string;
        directory: string;
        fileName: string;
    };
};
