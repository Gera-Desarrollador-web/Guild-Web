import React from "react";

type Props = {
    category: string;
    items: string[];
    newItem: string;
    setNewItem: (val: string) => void;
    onAddItem: (item: string) => void;
    onRemoveItem: (item: string) => void;
    onRemoveCategory: () => void;

    checkedItems: {
        [categoryName: string]: {
            [itemName: string]: boolean;
        };
    };

    toggleCheckItem: (item: string) => void;  // función para cambiar el estado de checkbox
};


const CategorySection: React.FC<Props> = ({
    category,
    items,
    newItem,
    setNewItem,
    onAddItem,
    onRemoveItem,
    onRemoveCategory,
    checkedItems,       // <-- agregar aquí
    toggleCheckItem,    // <-- agregar aquí
}) => {
    return (
        <div className="mb-4 border rounded p-2">
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold capitalize">{category}</h4>
                <button
                    className="text-red-500 text-sm hover:text-red-700"
                    onClick={onRemoveCategory}
                >
                    Eliminar categoría
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
                {items.map((item) => {
                    const isChecked = checkedItems[category]?.[item] || false;
                    return (
                        <label
                            key={item}
                            className="bg-gray-200 rounded px-2 py-1 text-sm flex items-center cursor-pointer"
                            style={{ color: isChecked ? "green" : "red" }}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCheckItem(item)}
                                className="mr-1"
                            />
                            {item}
                            <button
                                className="ml-2 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveItem(item);
                                }}
                            >
                                ✕
                            </button>
                        </label>
                    );
                })}
            </div>


            <div className="flex gap-2">
                <input
                    type="text"
                    className="border rounded px-2 py-1 text-sm w-full"
                    placeholder={`Agregar ítem a ${category}`}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                />
                <button
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    onClick={() => onAddItem(newItem)}
                >
                    Agregar
                </button>
            </div>
        </div>
    );
};

export default CategorySection;
