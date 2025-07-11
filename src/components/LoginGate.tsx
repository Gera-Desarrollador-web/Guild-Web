import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

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
    const [isLoading, setIsLoading] = useState(false);

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

        setIsLoading(true);
        try {
            await setDoc(doc(db, "config", "password"), {
                value: newPassword,
            });
            setCustomPassword(newPassword);
            alert("Contraseña actualizada correctamente");
            setChangeMode(false);
            setMasterInput("");
            setNewPassword("");
        } catch (err) {
            console.error("Error al guardar nueva contraseña:", err);
            alert("Error al guardar contraseña");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a1008] bg-[url('https://www.tibia.com/images/global/content/background-texture.png')] bg-repeat p-4">
            <div className="w-full max-w-md bg-[#2d1a0f] border-2 border-[#5a2800] rounded-xl shadow-lg overflow-hidden">
                {/* Cabecera estilo Tibia */}
                <div className="bg-[#5a2800] p-4 border-b-2 border-[#3a1800]">
                    <h2 className="text-2xl font-bold text-[#e8d8b0] text-center font-tibia">
                        {changeMode ? "Cambiar Contraseña" : "Acceso Protegido"}
                    </h2>
                </div>
                
                <div className="p-6">
                    {!changeMode ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[#c4a97a] text-sm font-medium mb-2">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    placeholder="Ingresa la contraseña"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1a1008] border border-[#5a2800] text-[#e8d8b0] rounded-lg focus:ring-2 focus:ring-[#c4a97a] focus:border-[#c4a97a] outline-none transition placeholder-[#c4a97a]"
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    autoFocus
                                />
                            </div>
                            
                            <button
                                onClick={handleLogin}
                                className="w-full bg-[#5a2800] hover:bg-[#7a3a00] text-[#e8d8b0] font-bold py-3 px-4 rounded-lg border border-[#3a1800] transition duration-200 shadow-md"
                            >
                                Entrar
                            </button>
                            
                            <div className="text-center">
                                <button
                                    onClick={() => setChangeMode(true)}
                                    className="text-[#c4a97a] hover:text-[#e8d8b0] text-sm underline transition"
                                >
                                    Cambiar contraseña
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[#c4a97a] text-sm font-medium mb-2">
                                    Contraseña Maestra Actual
                                </label>
                                <input
                                    type="password"
                                    placeholder="Ingresa la contraseña maestra"
                                    value={masterInput}
                                    onChange={(e) => setMasterInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1a1008] border border-[#5a2800] text-[#e8d8b0] rounded-lg focus:ring-2 focus:ring-[#c4a97a] focus:border-[#c4a97a] outline-none transition placeholder-[#c4a97a]"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[#c4a97a] text-sm font-medium mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    placeholder="Ingresa la nueva contraseña"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#1a1008] border border-[#5a2800] text-[#e8d8b0] rounded-lg focus:ring-2 focus:ring-[#c4a97a] focus:border-[#c4a97a] outline-none transition placeholder-[#c4a97a]"
                                />
                            </div>
                            
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setChangeMode(false);
                                        setMasterInput("");
                                        setNewPassword("");
                                    }}
                                    className="flex-1 bg-[#2d1a0f] hover:bg-[#3a1800] text-[#e8d8b0] font-bold py-3 px-4 rounded-lg border border-[#5a2800] transition duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isLoading}
                                    className="flex-1 bg-[#5a2800] hover:bg-[#7a3a00] text-[#e8d8b0] font-bold py-3 px-4 rounded-lg border border-[#3a1800] transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer estilo Tibia */}
                <div className="bg-[#1a1008] p-3 text-center text-[#c4a97a] text-xs border-t border-[#5a2800]">
                    Sistema de gestión de guild - Twenty Thieves
                </div>
            </div>
        </div>
    );
};

export default LoginGate;