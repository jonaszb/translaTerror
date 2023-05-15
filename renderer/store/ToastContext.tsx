import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext({
    showToast: (options: {
        title: string;
        message?: string;
        type: 'success' | 'danger';
        outputInfo?: { directory: string; fileName: string };
    }) => {},
    removeToast: (id: number) => {},
    toasts: [] as Toast[],
});

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (options: {
        title: string;
        message: string;
        type: 'success' | 'danger';
        outputInfo: { directory: string; fileName: string };
    }) => {
        const { title, message, type, outputInfo } = options;
        const id = Math.floor(Math.random() * Date.now());
        setToasts((prevToasts) => [...prevToasts, { title, message, type, id, outputInfo }]);
    };

    const removeToast = (id: number) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return <ToastContext.Provider value={{ showToast, removeToast, toasts }}>{children}</ToastContext.Provider>;
};

export const useToastContext = () => {
    const { showToast, removeToast, toasts } = useContext(ToastContext);
    return { showToast, removeToast, toasts };
};

type Toast = {
    title: string;
    message?: string;
    outputInfo?: { directory: string; fileName: string };
    type: 'success' | 'danger';
    id: number;
};
