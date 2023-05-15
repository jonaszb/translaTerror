import { FC, useEffect, useRef, useState } from 'react';
import { useToastContext } from '../../store/ToastContext';
import { CrossIcon } from '../icons';
import { Transition } from '@headlessui/react';
import { shell } from 'electron';

const transitionProperties = {
    leave: 'transition-all ease-in duration-500',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
};

const Toast: FC<{
    title: string;
    message?: string;
    outputInfo?: { directory: string; fileName: string };
    type: 'success' | 'danger';
    id: number;
}> = ({ title, message, type, id, outputInfo }) => {
    const { removeToast } = useToastContext();
    const [isShowing, setIsShowing] = useState(true);
    const ref = useRef(null);
    const displayTime = 5000;

    const deleteThisToast = (delay: number) => {
        setIsShowing(false);
        setTimeout(removeToast.bind(null, id), delay);
    };

    useEffect(() => {
        let timer = setTimeout(deleteThisToast.bind(this, 600), displayTime);
        // Remove the toast after displayTime unless the user hovers over it
        ref.current.addEventListener('mouseenter', () => clearTimeout(timer));
        ref.current.addEventListener('mouseleave', () => {
            clearTimeout(timer);
            timer = setTimeout(deleteThisToast.bind(this, 600), displayTime);
        });
        return () => clearTimeout(timer);
    }, []);

    return (
        <Transition ref={ref} show={isShowing} {...transitionProperties}>
            <div className={`w-96 animate-fade-in rounded ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                <div
                    className={`relative flex h-full flex-col rounded-r border-l-2 bg-zinc-700 bg-opacity-90 px-6 py-8 shadow-lg ${
                        type === 'success' ? 'border-green-500  text-green-100' : 'border-red-500 text-red-100'
                    }`}
                >
                    <button className="absolute right-4 top-4" onClick={deleteThisToast.bind(this, 0)}>
                        <CrossIcon
                            className={`scale-125 stroke-zinc-400 transition-all ${
                                type === 'success' ? 'hover:stroke-green-100' : 'hover:stroke-red-100'
                            }`}
                        />
                    </button>
                    <span className="mb-4 text-xl">{title}</span>
                    {message && <span className="whitespace-pre-wrap">{message}</span>}
                    {outputInfo && (
                        <div className="flex flex-col">
                            <span className="font-light">File saved as:</span>
                            <span
                                onClick={() => shell.openPath(outputInfo.directory + outputInfo.fileName)}
                                className="cursor-pointer underline"
                            >
                                {outputInfo.fileName}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Transition>
    );
};

export default Toast;
