import { useState } from "react";

import {
    Shield,
    ShieldOff
} from "lucide-react";

import {
    useLayerMode
} from "../context/LayerModeContext";
import {
    useToast
} from "../context/ToastContext";

function LayerSettings() {

    const {

        isLayerMode,

        enableLayerMode,

        disableLayerMode

    } = useLayerMode();

    const [password, setPassword] =
        useState("");

    const { showToast } =
        useToast();

    const handleToggle = () => {

        const saved =
            sessionStorage.getItem(
                "layerPassword"
            );

        // enable
        if (!isLayerMode) {

            // first setup
            if (!saved) {

                if (
                    password.trim().length < 4
                ) {

                    showToast("Password must be at least 4 characters");

                    return;
                }

                sessionStorage.setItem(
                    "layerPassword",
                    btoa(password)
                );

                enableLayerMode();

                setPassword("");

                return;
            }

            // unlock existing
            if (
                btoa(password) === saved
            ) {

                enableLayerMode();

                setPassword("");

            } else {

                showToast("Incorrect password");

            }

        }

        // disable
        else {

            disableLayerMode();

        }

    };

    return (

        <div
            className="w-full rounded-3xl border backdrop-blur-xl shadow-xl p-5"
            style={{
                background:
                    "rgba(13, 35, 24, 0.45)",

                borderColor:
                    "rgba(64, 210, 186, 0.15)"
            }}
        >

            {/* header */}
            <div className="flex items-center justify-between">

                <div>

                    <h2 className="text-sm font-semibold text-white">

                        Layer Mode

                    </h2>

                    <p className="text-[11px] text-white/45 mt-1">

                        Reveal hidden encrypted layers

                    </p>

                </div>

                {/* toggle */}
                <button

                    onClick={handleToggle}

                    className={`w-12 h-6 rounded-full transition-all relative border

                    ${isLayerMode
                            ? ""
                            : ""
                        }`}

                    style={{
                        background:
                            isLayerMode
                                ? "#40D2BA"
                                : "rgba(255,255,255,0.08)",

                        borderColor:
                            isLayerMode
                                ? "#40D2BA"
                                : "rgba(64, 210, 186, 0.15)"
                    }}
                >

                    <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-[#0D2318] transition-all

                        ${isLayerMode
                                ? "left-7"
                                : "left-1"
                            }`}
                    />

                </button>

            </div>

            {/* password */}
            {!isLayerMode && (

                <div className="mt-5">

                    <input

                        type="password"

                        placeholder="Enter Layer password"

                        value={password}

                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }

                        className="w-full h-11 rounded-2xl border px-4 text-sm text-white placeholder:text-white/30 outline-none"

                        style={{

                            background:
                                "rgba(255,255,255,0.03)",

                            borderColor:
                                "rgba(64, 210, 186, 0.12)"
                        }}

                    />

                </div>

            )}

            {/* footer status */}
            <div className="mt-5 flex items-center gap-2 text-xs text-white/45">

                {isLayerMode ? (

                    <>
                        <Shield
                            size={14}
                            className="text-[#40D2BA]"
                        />

                        Layer secured

                    </>

                ) : (

                    <>
                        <ShieldOff
                            size={14}
                            className="text-white/35"
                        />

                        Layer inactive

                    </>

                )}

            </div>

        </div>

    );

}

export default LayerSettings;