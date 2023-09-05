import Toast from './Toast';
import { useToastContext } from '../../store/ToastContext';

const ToastContainer = () => {
    const { toasts } = useToastContext();

    return (
        <div className="absolute right-8 top-8 flex flex-col gap-4">
            {toasts.map((toast, index) => (
                <Toast
                    key={index}
                    message={toast.message}
                    type={toast.type}
                    id={toast.id}
                    title={toast.title}
                    outputInfo={toast.outputInfo}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
