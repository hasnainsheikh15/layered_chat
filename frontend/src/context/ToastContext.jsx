import {
    createContext,
    useContext,
    useState
} from "react";

const ToastContext =
    createContext();

export const ToastProvider = ({
    children
}) => {

    const [toast, setToast] =
        useState(null);

    const showToast = (
        message,
        type = "error"
    ) => {

        setToast({
            message,
            type
        });

        setTimeout(() => {

            setToast(null);

        }, 2600);

    };

    return (

        <ToastContext.Provider
            value={{
                showToast
            }}
        >

            {children}

            {toast && (

                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">

                    <div

                        className="px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl text-sm text-white"

                        style={{

                            background:
                                toast.type === "error"
                                    ? "rgba(120, 25, 25, 0.35)"
                                    : "rgba(13, 35, 24, 0.55)",

                            borderColor:
                                toast.type === "error"
                                    ? "rgba(255, 80, 80, 0.15)"
                                    : "rgba(64, 210, 186, 0.15)"
                        }}
                    >

                        {toast.message}

                    </div>

                </div>

            )}

        </ToastContext.Provider>

    );

};

export const useToast = () =>
    useContext(ToastContext);