import ReactDOM from 'react-dom/client';
import Home from './App';
import AccountKey from './account-key';
import './samples/node-api';
import './index.css';
import FilesContextProvider from './store/FilesContext';
import { ToastProvider } from './store/ToastContext';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ToastProvider>
        <FilesContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" Component={Home} />
                    <Route path="/account-key" Component={AccountKey} />
                </Routes>
            </BrowserRouter>
        </FilesContextProvider>
    </ToastProvider>
);

postMessage({ payload: 'removeLoading' }, '*');
