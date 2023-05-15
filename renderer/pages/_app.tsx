import React from 'react';
import type { AppProps } from 'next/app';

import '../styles/globals.css';
import 'react-tooltip/dist/react-tooltip.css';
import MenuContextProvider from '../store/FilesContext';
import { ToastProvider } from '../store/ToastContext';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ToastProvider>
            <MenuContextProvider>
                <Component {...pageProps} />
            </MenuContextProvider>
        </ToastProvider>
    );
}

export default MyApp;
