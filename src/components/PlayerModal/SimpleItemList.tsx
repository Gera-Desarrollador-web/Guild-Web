import React from "react";

type SimpleItemListProps = {
    items: string[];
    allMembers: { name: string }[];
    onItemClick?: (item: string) => void;
    onRemoveItem: (item: string) => void;
};

export const SimpleItemList: React.FC<SimpleItemListProps> = ({
    items,
    allMembers,
    onItemClick,
    onRemoveItem,
}) => {
    return (
        <div className="bg-[#2d1a0f] border-2 border-[#5a2800] rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {items.length > 0 ? (
                    <ul className="divide-y divide-[#3a1800]">
                        {items.map((item) => {
                            const isMember = allMembers.some((m) => m.name === item);

                            return (
                                <li 
                                    key={item} 
                                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 hover:bg-[#3a1800] transition-colors"
                                >
                                    <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                                        {isMember && onItemClick ? (
                                            <button
                                                className="w-full text-left text-[#c4a97a] hover:text-[#e8d8b0] hover:underline truncate font-medium"
                                                onClick={() => onItemClick(item)}
                                                title={`Ver ${item}`}
                                            >
                                                {item}
                                            </button>
                                        ) : (
                                            <span className="text-[#e8d8b0] truncate block" title={item}>
                                                {item}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onRemoveItem(item)}
                                        className="text-sm bg-[#5a2800] hover:bg-[#7a3a00] text-[#ff9999] hover:text-white px-3 py-1 rounded border border-[#3a1800] transition-colors"
                                        title="Eliminar"
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="p-6 text-center">
                        <p className="text-[#c4a97a] italic">No hay elementos para mostrar</p>
                    </div>
                )}
            </div>
        </div>
    );
};