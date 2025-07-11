import React from "react";
import { BossEntry } from "../../types";
import { AddSubItemInput } from "./AddSubItemInput";

type BossQuestListProps = {
    items: BossEntry[];
    activeTab: "bosses" | "quests";
    checkedItems: { [key: string]: boolean };
    playerName: string;
    onItemCheck: (itemName: string, checked: boolean) => void;
    onSubItemCheck: (itemName: string, subItem: string, checked: boolean) => void;
    onRemoveItem: (itemName: string) => void;
    onRemoveSubItem: (itemName: string, subItem: string) => void;
    onAddSubItem: (entryName: string, subItem: string) => void;
};

export const BossQuestList: React.FC<BossQuestListProps> = ({
    items,
    activeTab,
    checkedItems,
    onItemCheck,
    onSubItemCheck,
    onRemoveItem,
    onRemoveSubItem,
    onAddSubItem
}) => {
    const getHeaderText = () => {
        return activeTab === "bosses" ? "Lista de Bosses" : "Lista de Quests";
    };

    return (
        <div className="bg-[#2d1a0f] border-2 border-[#5a2800] rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#5a2800] p-2 border-b border-[#3a1800]">
                <h3 className="text-[#e8d8b0] font-bold text-center">{getHeaderText()}</h3>
            </div>
            
            <div className="p-3">
                <ul className="max-h-64 overflow-y-auto custom-scrollbar">
                    {items.map((entry) => (
                        <li key={entry.name} className="mb-3 last:mb-0 border-b border-[#3a1800] pb-2 last:border-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                                <div className="flex items-center space-x-2 mb-1 sm:mb-0">
                                    <input
                                        type="checkbox"
                                        checked={checkedItems[entry.name] || false}
                                        onChange={(e) => onItemCheck(entry.name, e.target.checked)}
                                        className="w-4 h-4 text-[#c4a97a] bg-[#1a1008] border-[#5a2800] rounded focus:ring-[#c4a97a]"
                                    />
                                    <span className="font-semibold text-[#e8d8b0]">{entry.name}</span>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(entry.name)}
                                    className="text-[#ff6b6b] hover:text-[#ff8f8f] text-sm bg-[#3a1800] hover:bg-[#5a2800] px-2 py-1 rounded transition"
                                    title={`Eliminar ${activeTab.slice(0, -1)}`}
                                >
                                    Eliminar
                                </button>
                            </div>

                            {entry.subItems.length > 0 && (
                                <ul className="ml-4 sm:ml-6 mb-2 mt-1 space-y-1">
                                    {entry.subItems.map((sub) => (
                                        <li key={sub} className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                            <div className="flex items-center space-x-2 mb-1 sm:mb-0">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedItems[`${entry.name}::${sub}`] || false}
                                                    onChange={(e) => onSubItemCheck(entry.name, sub, e.target.checked)}
                                                    className="w-4 h-4 text-[#c4a97a] bg-[#1a1008] border-[#5a2800] rounded focus:ring-[#c4a97a]"
                                                />
                                                <span className="text-[#c4a97a]">{sub}</span>
                                            </div>
                                            <button
                                                onClick={() => onRemoveSubItem(entry.name, sub)}
                                                className="text-[#ff6b6b] hover:text-[#ff8f8f] text-sm bg-[#3a1800] hover:bg-[#5a2800] px-2 py-1 rounded transition"
                                                title="Eliminar subitem"
                                            >
                                                Eliminar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <AddSubItemInput
                                entryName={entry.name}
                                onAddSubItem={onAddSubItem}
                                className="mt-2"
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};