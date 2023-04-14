import React from 'react';
import type { AppProps } from 'next/app';

import '../styles/globals.css';
import 'react-tooltip/dist/react-tooltip.css';
import MenuContextProvider from '../store/MenuContext';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <MenuContextProvider>
            <Component {...pageProps} />
        </MenuContextProvider>
    );
}

export default MyApp;
