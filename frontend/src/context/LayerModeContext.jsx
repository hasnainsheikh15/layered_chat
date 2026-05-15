import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const LayerModeContext =
    createContext();

export const LayerModeProvider = ({
    children
}) => {

    const [isLayerMode, setIsLayerMode] =
        useState(false);

    useEffect(() => {

        const stored =
            sessionStorage.getItem(
                "layerMode"
            );

        if (stored === "true") {
            setIsLayerMode(true);
        }

    }, []);

    const enableLayerMode = () => {

        sessionStorage.setItem(
            "layerMode",
            "true"
        );

        setIsLayerMode(true);

    };

    const disableLayerMode = () => {

        sessionStorage.removeItem(
            "layerMode"
        );

        setIsLayerMode(false);

    };

    return (

        <LayerModeContext.Provider
            value={{

                isLayerMode,

                enableLayerMode,

                disableLayerMode

            }}
        >

            {children}

        </LayerModeContext.Provider>

    );

};

export const useLayerMode = () =>
    useContext(LayerModeContext);