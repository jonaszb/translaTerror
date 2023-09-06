import ReactDOM from 'react-dom/client';
import Home from './App';
import AccountKey from './account-key';
import './samples/node-api';
import './index.css';
import FilesContextProvider from './store/FilesContext';
import { ToastProvider } from './store/ToastContext';
import { Route, Switch, HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ToastProvider>
        <FilesContextProvider>
            <HashRouter>
                <Switch>
                    <Route exact path="/">
                        <Home />
                    </Route>
                    <Route>
                        <AccountKey />
                    </Route>
                </Switch>
            </HashRouter>
        </FilesContextProvider>
    </ToastProvider>
);

postMessage({ payload: 'removeLoading' }, '*');
