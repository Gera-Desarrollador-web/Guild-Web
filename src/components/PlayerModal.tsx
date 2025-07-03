import React, { useState } from "react";
import CategorySection from "./CategorySection";
import AddCategoryForm from "./AddCategoryForm";
import { GuildMember } from "../types";

type Props = {
    selectedPlayer: GuildMember | null;
    setSelectedPlayer: (player: GuildMember | null) => void;
    allMembers: GuildMember[];
    setAllMembers: React.Dispatch<React.SetStateAction<GuildMember[]>>;
    checkedItems: {
        [playerName: string]: {
            [categoryName: string]: {
                [itemName: string]: boolean;
            };
        };
    };
    setCheckedItems: React.Dispatch<
        React.SetStateAction<{
            [playerName: string]: {
                [categoryName: string]: {
                    [itemName: string]: boolean;
                };
            };
        }>
    >;

};

const PlayerModal: React.FC<Props> = ({
    selectedPlayer,
    setSelectedPlayer,
    allMembers,
    setAllMembers,
    checkedItems,
    setCheckedItems,

}) => {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newItems, setNewItems] = useState<{ [key: string]: string }>({});


    if (!selectedPlayer) return null;


    const vocationGifs: { [key: string]: { [key: string]: string } } = {
        "Knight": {
            male: "/Knight.gif",
            female: "/knightFemale.gif",
        },
        "Elite Knight": {
            male: "/Knight.gif",
            female: "/KnightFemale.gif",
        },
        "Paladin": {
            male: "/Hunter.gif",
            female: "/HunterFemale.gif",
        },
        "Royal Paladin": {
            male: "/Hunter.gif",
            female: "/HunterFemale.gif",
        },
        "Sorcerer": {
            male: "/Mage.gif",
            female: "/MageFemale.gif",
        },
        "Master Sorcerer": {
            male: "/Mage.gif",
            female: "/MageFemale.gif",
        },
        "Druid": {
            male: "/Druid.gif",
            female: "/druidFemale.gif",
        },
        "Elder Druid": {
            male: "/Druid.gif",
            female: "/druidFemale.gif",
        },
        "Monk": {
            male: "/Monk.gif",
            female: "/MonkFemale.gif",
        },
        "Exalted Monk": {
            male: "/Monk.gif",
            female: "/MonkFemale.gif",
        }
    };


    const vocationGifUrl =
        vocationGifs[selectedPlayer.vocation]?.[selectedPlayer.sex.toLowerCase()] ||
        "https://media.giphy.com/media/ya4eevXU490Iw/giphy.gif";


    const close = () => setSelectedPlayer(null);



    const addCategory = () => {
        if (!newCategoryName.trim()) return;

        // Verificar si ya existe en algún miembro para evitar duplicados
        if (allMembers.some(member => member.categories?.[newCategoryName])) return;

        const updatedMembers = allMembers.map(member => {
            const categories = member.categories || {};
            return {
                ...member,
                categories: {
                    ...categories,
                    [newCategoryName]: [],
                },
            };
        });

        setAllMembers(updatedMembers);

        // Si quieres que el selectedPlayer refleje el cambio inmediatamente
        if (selectedPlayer) {
            setSelectedPlayer(updatedMembers.find(m => m.name === selectedPlayer.name) || null);
        }

        setNewCategoryName("");
    };


    const removeCategory = (category: string) => {
        // Verificar si la categoría contiene ítems en algún miembro
        const hasItemsInAnyMember = allMembers.some(
            (member) => member.categories?.[category]?.length > 0
        );
        if (hasItemsInAnyMember) {
            alert("No se puede eliminar esta categoría porque contiene elementos en al menos un miembro.");
            return;
        }

        // Eliminar la categoría de todos los miembros
        const updatedMembers = allMembers.map(member => {
            const newCategories = { ...member.categories };
            delete newCategories[category];
            return { ...member, categories: newCategories };
        });
        setAllMembers(updatedMembers);

        // Limpiar también los checkedItems de esa categoría para todos
        const updatedCheckedItems = { ...checkedItems };
        Object.keys(updatedCheckedItems).forEach(playerName => {
            if (updatedCheckedItems[playerName][category]) {
                delete updatedCheckedItems[playerName][category];
            }
        });
        setCheckedItems(updatedCheckedItems);

        // Actualizar selectedPlayer si corresponde
        setSelectedPlayer(updatedMembers.find(m => m.name === selectedPlayer.name) || null);
    };


    const addItem = (category: string, item: string) => {
        if (!item.trim()) return;

        const updatedMembers = allMembers.map(member => {
            const categories = member.categories || {};
            const items = categories[category] || [];

            // Evitar duplicados en cada miembro
            if (items.includes(item)) return member;

            return {
                ...member,
                categories: {
                    ...categories,
                    [category]: [...items, item],
                },
            };
        });

        setAllMembers(updatedMembers);

        // Actualizar checkedItems para cada miembro con el nuevo item marcado como false
        setCheckedItems(prev => {
            const newChecked = { ...prev };
            updatedMembers.forEach(member => {
                if (!newChecked[member.name]) newChecked[member.name] = {};
                if (!newChecked[member.name][category]) newChecked[member.name][category] = {};
                newChecked[member.name][category][item] = false;
            });
            return newChecked;
        });

        setNewItems(prev => ({ ...prev, [category]: "" }));

        // Actualizar selectedPlayer si está seleccionado
        if (selectedPlayer) {
            setSelectedPlayer(updatedMembers.find(m => m.name === selectedPlayer.name) || null);
        }
    };


    const removeItem = (category: string, item: string) => {
        // Verificar si el ítem está marcado en algún jugador
        const isCheckedInAny = Object.values(checkedItems).some(playerChecks =>
            playerChecks?.[category]?.[item]
        );
        if (isCheckedInAny) {
            alert("No se puede eliminar este ítem porque está marcado por al menos un jugador.");
            return;
        }

        // Eliminar el ítem en todos los miembros
        const updatedMembers = allMembers.map(member => {
            const catItems = member.categories?.[category] || [];
            return {
                ...member,
                categories: {
                    ...member.categories,
                    [category]: catItems.filter(i => i !== item),
                },
            };
        });
        setAllMembers(updatedMembers);

        // También eliminar el checkedItem de ese ítem para todos
        const updatedCheckedItems = { ...checkedItems };
        Object.keys(updatedCheckedItems).forEach(playerName => {
            if (updatedCheckedItems[playerName]?.[category]?.[item] !== undefined) {
                delete updatedCheckedItems[playerName][category][item];
            }
        });
        setCheckedItems(updatedCheckedItems);

        // Actualizar selectedPlayer si corresponde
        setSelectedPlayer(updatedMembers.find(m => m.name === selectedPlayer.name) || null);
    };

    const toggleCheckItem = (playerName: string, category: string, item: string) => {
        setCheckedItems((prev) => {
            const playerChecks = prev[playerName] || {};
            const catChecks = playerChecks[category] || {};
            const current = catChecks[item] || false;

            return {
                ...prev,
                [playerName]: {
                    ...playerChecks,
                    [category]: {
                        ...catChecks,
                        [item]: !current,
                    },
                },
            };
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    {/* Sección izquierda: texto y gif */}
                    <div className="flex">
                        <div>
                            <h3 className="text-lg font-bold pb-1">{selectedPlayer.name}</h3>
                            <p><span className="font-bold">Lvl: </span>{selectedPlayer.level}</p>
                            <p><span className="font-bold">Vocation: </span>{selectedPlayer.vocation}</p>
                            <p>
                                <span className="font-bold">Status: </span>
                                <span className={`${selectedPlayer.status.toLowerCase() === "online" ? "text-green-600" : "text-gray-700"}`}>
                                    {selectedPlayer.status}
                                </span>
                            </p>
                        </div>

                        <img
                            src={vocationGifUrl}
                            alt="Vocation gif"
                            className="w-20 h-20 ml-4 object-contain"
                        />
                    </div>

                    <button
                        className="text-gray-600 hover:text-black self-start"
                        onClick={close}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Sección de muertes - abajo del header */}
                {selectedPlayer.deaths && selectedPlayer.deaths.length > 0 && (
                    <div className="bg-white mb-4">
                        <h4 className="text-md font-bold mb-2">
                            {selectedPlayer.deaths.length === 1
                                ? "murió recientemente:"
                                : "murió varias veces recientemente:"}
                        </h4>
                        <ul className="space-y-1 text-sm max-h-20 overflow-y-auto">
                            {selectedPlayer.deaths?.map((death, idx) => (
                                <li key={idx} className="border-b pb-1">
                                    <div className="text-gray-700">
                                        <span className="font-semibold">Nivel:</span> {death.level}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-semibold">Fecha:</span>{" "}
                                        {new Date(death.time).toLocaleString()}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-semibold">Razón:</span> {death.reason}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}


                <AddCategoryForm
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    onAddCategory={addCategory}
                />

                {selectedPlayer.categories &&
                    Object.entries(selectedPlayer.categories).map(([cat, items]) => (
                        <CategorySection
                            key={cat}
                            category={cat}
                            items={items}
                            newItem={newItems[cat] || ""}
                            setNewItem={(val) => setNewItems((prev) => ({ ...prev, [cat]: val }))}
                            onAddItem={(item) => addItem(cat, item)}
                            onRemoveItem={(item) => removeItem(cat, item)}
                            onRemoveCategory={() => removeCategory(cat)}
                            checkedItems={checkedItems[selectedPlayer.name] || {}}
                            toggleCheckItem={(item) => toggleCheckItem(selectedPlayer.name, cat, item)}
                        />
                    ))}
            </div>
        </div>
    );
};

export default PlayerModal;
