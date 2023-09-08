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
    message?: string;
    downloadData: {
        downloaded: boolean;
        url: string;
        directory: string;
        fileName: string;
    };
};

export type EventDataWithFiles = {
    eventId: string;
    status: number;
    message?: string;
    files: FileItem[];
    fragData?: {
        redundancy: number;
        redundancyRatio: string;
        totalLength: number;
    };
};

export type Toast = {
    title: string;
    message?: string;
    outputInfo?: ToastOutputInfo;
    type: 'success' | 'danger';
    id: number;
};

export type ToastOutputInfo = { directory: string; fileName: string } | { directory: string; fileName: string }[];
