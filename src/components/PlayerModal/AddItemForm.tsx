import React, { useRef, useState, useEffect } from "react";

type AddItemFormProps = {
    activeTab: string;
    newItem: string;
    filteredSuggestions: string[];
    onNewItemChange: (value: string) => void;
    onShowSuggestionsChange: (show: boolean) => void;
    onAddItem: () => void;
     onEditItem: () => void; // Nueva prop
    onCancelEdit: () => void; // Nueva prop
    inputPosition: { top: number; left: number; width: number } | null; //
    onSuggestionClick: (name: string) => void;
    isEditing: boolean;
    className?: string;
    
};

export const AddItemForm: React.FC<AddItemFormProps> = ({
    activeTab,
    newItem,
    filteredSuggestions,
    onNewItemChange,
    onShowSuggestionsChange,
    onAddItem,
    onSuggestionClick,
     onEditItem,
    onCancelEdit,
    isEditing,
    className = "",
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionStyle, setSuggestionStyle] = useState<React.CSSProperties>({});
    

    // Calcular posición fija que sobresale pero no se mueve con scroll
    const updateSuggestionPosition = () => {
        if (inputRef.current && showSuggestions) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const modalRect = inputRef.current.closest('.modal-container')?.getBoundingClientRect();

            // Calcular espacio disponible
            const spaceBelow = window.innerHeight - inputRect.bottom;
            const maxHeight = Math.min(240, spaceBelow - 20); // 240px máximo o espacio disponible

            // Posición absoluta dentro del modal pero con overflow visible
            setSuggestionStyle({
                position: 'fixed', // Usamos fixed para que no se mueva con scroll
                top: `${inputRect.bottom}px`,
                left: `${inputRect.left}px`,
                width: `${inputRect.width}px`,
                maxHeight: `${Math.max(100, maxHeight)}px`,
                zIndex: 9999, // Aseguramos que esté por encima del modal
                transform: modalRect ? `translateX(-${inputRect.left - modalRect.left}px)` : 'none'
            });
        }
    };

    useEffect(() => {
        if (showSuggestions) {
            updateSuggestionPosition();
            const modalContainer = inputRef.current?.closest('.modal-container');

            const observer = new MutationObserver(updateSuggestionPosition);
            if (modalContainer) {
                observer.observe(modalContainer, { attributes: true });
            }

            window.addEventListener('resize', updateSuggestionPosition);
            window.addEventListener('scroll', updateSuggestionPosition, true);

            return () => {
                observer.disconnect();
                window.removeEventListener('resize', updateSuggestionPosition);
                window.removeEventListener('scroll', updateSuggestionPosition, true);
            };
        }
    }, [showSuggestions, filteredSuggestions]);

    const handleInputFocus = () => {
        setShowSuggestions(true);
        onShowSuggestionsChange(true);
    };

    const handleInputBlur = () => {
        setTimeout(() => {
            if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
                onShowSuggestionsChange(false);
            }
        }, 200);
    };

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                onShowSuggestionsChange(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getPlaceholderText = () => {
        switch (activeTab) {
            case "bosses": return "Añadir nuevo boss...";
            case "quests": return "Añadir nueva quest...";
            case "chares": return "Añadir nuevo character...";
            case "notas": return "Añadir nueva nota...";
            default: return `Añadir ${activeTab}...`;
        }
    };

   return (
    <div className={`mb-8 ${className}`}>
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow mt-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={newItem}
                    onChange={(e) => {
                        onNewItemChange(e.target.value);
                        if (activeTab === "chares") {
                            setShowSuggestions(true);
                            onShowSuggestionsChange(true);
                        }
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (isEditing) {
                                onEditItem();
                            } else {
                                onAddItem();
                            }
                        } else if (e.key === "Escape" && isEditing) {
                            onCancelEdit();
                        }
                    }}
                    className="w-full bg-[#1a1008] border border-[#5a2800] text-[#e8d8b0] px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#c4a97a] focus:border-[#c4a97a] outline-none transition placeholder-[#c4a97a]"
                    placeholder={getPlaceholderText()}
                    autoFocus={isEditing}
                />
            </div>

            {isEditing ? (
                <div className="flex gap-2 sm:self-center mt-4">
                    <button
                        onClick={onEditItem}
                        className="bg-[#5a2800] hover:bg-[#7a3a00] text-[#e8d8b0] font-medium px-4 py-3 rounded-lg border border-[#3a1800] transition-colors shadow-md"
                        disabled={!newItem.trim()}
                    >
                        Guardar
                    </button>
                    <button
                        onClick={onCancelEdit}
                        className="bg-[#3a1800] hover:bg-[#5a2800] text-[#e8d8b0] font-medium px-4 py-3 rounded-lg border border-[#3a1800] transition-colors shadow-md"
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <button
                    onClick={onAddItem}
                    className="sm:self-center mt-4 bg-[#5a2800] hover:bg-[#7a3a00] text-[#e8d8b0] font-medium px-6 py-3 rounded-lg border border-[#3a1800] transition-colors shadow-md"
                    disabled={!newItem.trim()}
                >
                    Añadir
                </button>
            )}
        </div>

        {/* Sugerencias con posición fija que sobresalen pero no se mueven */}
        {showSuggestions && filteredSuggestions.length > 0 && (
            <ul
                ref={suggestionsRef}
                className="fixed bg-[#2d1a0f] border-2 border-[#5a2800] rounded-lg shadow-lg overflow-y-auto custom-scrollbar"
                style={suggestionStyle}
            >
                {filteredSuggestions.map((name) => (
                    <li
                        key={name}
                        className="px-4 py-2 cursor-pointer text-[#e8d8b0] hover:bg-[#5a2800] transition-colors border-b border-[#3a1800] last:border-0"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onSuggestionClick(name);
                            setShowSuggestions(false);
                        }}
                    >
                        {name}
                    </li>
                ))}
            </ul>
        )}
    </div>
);
};