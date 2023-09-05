import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './App';
import './samples/node-api';
import './index.css';
import FilesContextProvider from './store/FilesContext';
import { ToastProvider } from './store/ToastContext';
// import './index.npx tailwindcss -i ./src/index.css -o ./dist/output.css --watchcss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ToastProvider>
        <FilesContextProvider>
            <Home />;
        </FilesContextProvider>
    </ToastProvider>
);

postMessage({ payload: 'removeLoading' }, '*');
