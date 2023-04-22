import { FileItem } from '../types';

export const pathToFileItem = (path: string): FileItem => {
    const nameWithExtension = path.split(/[\\\/]/).pop();
    const lastDot = nameWithExtension.lastIndexOf('.');
    const name = nameWithExtension.slice(0, lastDot);
    const extension = nameWithExtension.slice(lastDot + 1);
    return {
        path,
        name,
        extension,
    };
};
