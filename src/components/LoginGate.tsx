import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate que la ruta sea correcta

type Props = {
    onAuthenticated: () => void;
};

const DEFAULT_MASTER_PASSWORD = "admin123";

const LoginGate: React.FC<Props> = ({ onAuthenticated }) => {
    const [input, setInput] = useState("");
    const [customPassword, setCustomPassword] = useState<string | null>(null);
    const [changeMode, setChangeMode] = useState(false);
    const [masterInput, setMasterInput] = useState("");
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const fetchPassword = async () => {
            try {
                const docRef = doc(db, "config", "password");
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    if (typeof data.value === "string") {
                        setCustomPassword(data.value);
                    }
                }
            } catch (err) {
                console.error("Error al cargar contraseña:", err);
            }
        };

        fetchPassword();
    }, []);

    const handleLogin = () => {
        const passwordToCheck = customPassword || DEFAULT_MASTER_PASSWORD;
        if (input === passwordToCheck) {
            onAuthenticated();
        } else {
            alert("Contraseña incorrecta");
        }
    };

 const handleChangePassword = async () => {
        if (masterInput !== DEFAULT_MASTER_PASSWORD) {
            alert("Contraseña maestra incorrecta");
            return;
        }

        if (!newPassword.trim()) {
            alert("Nueva contraseña no puede estar vacía");
            return;
        }
        try {
            await setDoc(doc(db, "config", "password"), {
                value: newPassword,
            });
            setCustomPassword(newPassword);
            alert("Contraseña actualizada correctamente");
            setChangeMode(false);
        } catch (err) {
            console.error("Error al guardar nueva contraseña:", err);
            alert("Error al guardar contraseña");
        }
        alert("Contraseña actualizada correctamente");
        setChangeMode(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h2 className="text-xl font-bold">🔒 Acceso protegido</h2>

            {!changeMode ? (
                <>
                    <input
                        type="password"
                        placeholder="Ingresa contraseña"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="border px-4 py-2 rounded"
                    />
                    <button
                        onClick={handleLogin}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setChangeMode(true)}
                        className="text-sm text-gray-600 underline"
                    >
                        Cambiar contraseña
                    </button>
                </>
            ) : (
                <div className="w-64 flex flex-col gap-2 border p-4 rounded bg-gray-100">
                    <input
                        type="password"
                        placeholder="Contraseña maestra"
                        value={masterInput}
                        onChange={(e) => setMasterInput(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />
                    <button
                        onClick={handleChangePassword}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                        Guardar nueva contraseña
                    </button>
                    <button
                        onClick={() => setChangeMode(false)}
                        className="text-xs text-red-500 underline mt-2"
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoginGate;
