import React from 'react';
import type { AppProps } from 'next/app';

import '../styles/globals.css';
import 'react-tooltip/dist/react-tooltip.css';

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
