import { FileItem } from '../../types';

export const pathToFileItem = (path: string): FileItem => {
    const nameWithExtension = path.split(/[\\\/]/).pop();
    if (!nameWithExtension) throw new Error(`Invalid path: ${path}`);
    const lastDot = nameWithExtension.lastIndexOf('.');
    const name = nameWithExtension.slice(0, lastDot);
    const extension = nameWithExtension.slice(lastDot + 1);
    return {
        path,
        name,
        extension,
    };
};

export const formatTime = (seconds: number) => {
    if (seconds < 0 || seconds > 86400) {
        return 'N/A';
    }

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const parts: string[] = [];
    if (hours) {
        parts.push(String(hours).padStart(2, '0'));
    }
    if (minutes || hours) {
        parts.push(String(minutes).padStart(2, '0'));
    }
    parts.push(String(seconds).padStart(2, '0'));

    if (parts.length === 1) return parts[0] + 's';
    return parts.join(':');
};
