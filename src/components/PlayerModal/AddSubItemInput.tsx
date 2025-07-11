import React, { useState } from "react";

type AddSubItemInputProps = {
    entryName: string;
    onAddSubItem: (entryName: string, subItem: string) => void;
    className?: string;
};

export const AddSubItemInput: React.FC<AddSubItemInputProps> = ({ 
    entryName, 
    onAddSubItem,
    className = ""
}) => {
    const [subItemName, setSubItemName] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const onAdd = () => {
        if (!subItemName.trim()) return;
        onAddSubItem(entryName, subItemName.trim());
        setSubItemName("");
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`${className} text-[#c4a97a] hover:text-[#e8d8b0] text-sm hover:underline transition-colors`}
            >
                + Añadir subitem
            </button>
        );
    }

    return (
        <div className={`${className} flex flex-col sm:flex-row gap-2 items-start sm:items-center`}>
            <input
                type="text"
                value={subItemName}
                onChange={(e) => setSubItemName(e.target.value)}
                placeholder="Nombre del subitem"
                className="flex-1 bg-[#1a1008] border border-[#5a2800] text-[#e8d8b0] px-3 py-2 rounded focus:ring-2 focus:ring-[#c4a97a] focus:border-[#c4a97a] outline-none transition placeholder-[#5a2800]"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        onAdd();
                    } else if (e.key === "Escape") {
                        setIsOpen(false);
                    }
                }}
                autoFocus
            />
            
            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={onAdd}
                    className="flex-1 sm:flex-none bg-[#5a2800] hover:bg-[#7a3a00] text-[#e8d8b0] px-3 py-2 rounded border border-[#3a1800] transition"
                    title="Añadir"
                >
                    Añadir
                </button>
                <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 sm:flex-none bg-[#2d1a0f] hover:bg-[#3a1800] text-[#e8d8b0] px-3 py-2 rounded border border-[#5a2800] transition"
                    title="Cancelar"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};