import { ipcRenderer } from 'electron';
import { FormEvent, useEffect, useState } from 'react';

function AccountKey() {
    const [keyValue, setKeyValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [keyError, setKeyError] = useState(false);

    const inputChangeHandler = (event: FormEvent<HTMLInputElement>) => {
        setKeyError(false);
        setKeyValue(event.currentTarget.value);
    };

    const submitHandler = (event: FormEvent) => {
        event.preventDefault();
        setIsProcessing(true);
        setKeyError(false);
        ipcRenderer.send('setServiceKey', keyValue);
    };

    const cancelHandler = (event: FormEvent) => {
        event.preventDefault();
        ipcRenderer.send('closeAccKeyWindow');
    };

    useEffect(() => {
        ipcRenderer.on('serviceKeySet', (event, data) => {
            setIsProcessing(false);
            if (data) {
                ipcRenderer.send('closeAccKeyWindow');
            } else {
                setKeyError(true);
            }
        });
        return () => {
            ipcRenderer.removeAllListeners('serviceKeySet');
        };
    }, []);

    return (
        <>
            <main>
                <form
                    className="flex h-screen flex-col items-center justify-center px-16 py-8"
                    onSubmit={submitHandler}
                >
                    <p className="mb-4 font-source-sans text-zinc-200">
                        TranslaTerror requires a service account key to unlock cloud-based operations. Contact the
                        developer to obtain a key.
                    </p>
                    <div className="mb-4 flex w-full flex-col">
                        <label className="text-lg text-zinc-200" htmlFor="service-key">
                            Service account key
                        </label>
                        <input
                            disabled={isProcessing}
                            className={`w-full rounded border bg-transparent px-1.5 py-2 text-zinc-100 shadow-inner outline-none transition-all disabled:opacity-75 ${
                                keyError
                                    ? ' border-red-500'
                                    : 'border-zinc-500 hover:border-zinc-400 focus:border-zinc-400'
                            }`}
                            type="password"
                            id="service-key"
                            onChange={inputChangeHandler}
                        />
                    </div>
                    <div className="flex w-full justify-between">
                        <span className="text-md text-red-500">{keyError ? 'Invalid key' : ''}</span>
                        <div className="flex justify-end gap-4">
                            <button
                                disabled={isProcessing}
                                className={`rounded border border-zinc-400 border-opacity-30 bg-zinc-400 bg-opacity-20 px-4 py-1.5 text-zinc-200 shadow transition-all hover:brightness-110 disabled:opacity-75 ${
                                    isProcessing ? 'pointer-events-none' : ''
                                }`}
                                onClick={cancelHandler}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isProcessing}
                                className={`rounded border border-green-300 border-opacity-30 bg-green-500 bg-opacity-20 px-4 py-1.5 text-green-300 shadow transition-all hover:brightness-110 disabled:opacity-75 ${
                                    isProcessing ? 'pointer-events-none' : ''
                                }`}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
}

export default AccountKey;
