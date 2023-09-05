import React, { createContext, useContext, useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

const AccKeyContext = createContext({
    hasValidKey: false,
    checkedForKey: false,
});

export const AccKeyProvider = ({ children }: any) => {
    const [hasValidKey, setHasValidKey] = useState<boolean>(false);
    const [checkedForKey, setCheckedForKey] = useState<boolean>(false);

    useEffect(() => {
        ipcRenderer.send('checkAccKey');
        ipcRenderer.on('serviceKeySet', (event, data) => {
            console.log('serviceKeySet', data);
            setHasValidKey(data);
            setCheckedForKey(true);
        });
        return () => {
            ipcRenderer.removeAllListeners('serviceKeySet');
        };
    }, []);

    return <AccKeyContext.Provider value={{ hasValidKey, checkedForKey }}>{children}</AccKeyContext.Provider>;
};

export const useAccKeyContext = () => {
    const { hasValidKey, checkedForKey } = useContext(AccKeyContext);
    return { hasValidKey, checkedForKey };
};
