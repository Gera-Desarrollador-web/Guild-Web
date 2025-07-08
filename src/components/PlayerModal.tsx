import React, { useState, useRef, useEffect } from "react";
import { BossEntry, GuildMember } from "../types";
import { createPortal } from "react-dom";

type CheckedItems = {
    [playerName: string]: {
        bosses?: { [item: string]: boolean };
        quests?: { [item: string]: boolean };
        chares?: { [item: string]: boolean };
        notas?: { [item: string]: boolean };
    };
};

type Props = {
    selectedPlayer: GuildMember | null;
    setSelectedPlayer: (player: GuildMember | null) => void;
    allMembers: GuildMember[];
    setAllMembers: React.Dispatch<React.SetStateAction<GuildMember[]>>;
    checkedItems: CheckedItems;
    setCheckedItems: React.Dispatch<React.SetStateAction<CheckedItems>>;
};

const tabs = ["bosses", "quests", "chares", "notas"] as const;
type Tab = typeof tabs[number];

const PlayerModal: React.FC<Props> = ({
    selectedPlayer,
    setSelectedPlayer,
    allMembers,
    setAllMembers,
    checkedItems,
    setCheckedItems,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>("bosses");
    const [newItem, setNewItem] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputPosition, setInputPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Estado para controlar qué inputs de subitem están abiertos
    const [openSubItemInputs, setOpenSubItemInputs] = useState<{ [entryName: string]: boolean }>({});

    const openInputForEntry = (entryName: string) => {
        setOpenSubItemInputs((prev) => ({ ...prev, [entryName]: true }));
    };

    const closeInputForEntry = (entryName: string) => {
        setOpenSubItemInputs((prev) => ({ ...prev, [entryName]: false }));
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !document.getElementById("suggestions-portal")?.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (showSuggestions && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setInputPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
        } else {
            setInputPosition(null);
        }
    }, [showSuggestions, newItem]);

    if (!selectedPlayer) return null;

    // Vocation gifs (igual que antes)
    const vocationGifs: { [key: string]: { [key: string]: string } } = {
        Knight: { male: "/Knight.gif", female: "/knightFemale.gif" },
        "Elite Knight": { male: "/Knight.gif", female: "/KnightFemale.gif" },
        Paladin: { male: "/Hunter.gif", female: "/HunterFemale.gif" },
        "Royal Paladin": { male: "/Hunter.gif", female: "/HunterFemale.gif" },
        Sorcerer: { male: "/Mage.gif", female: "/MageFemale.gif" },
        "Master Sorcerer": { male: "/Mage.gif", female: "/MageFemale.gif" },
        Druid: { male: "/Druid.gif", female: "/druidFemale.gif" },
        "Elder Druid": { male: "/Druid.gif", female: "/druidFemale.gif" },
        Monk: { male: "/Monk.gif", female: "/MonkFemale.gif" },
        "Exalted Monk": { male: "/Monk.gif", female: "/MonkFemale.gif" },
    };

    const vocationGifUrl =
        vocationGifs[selectedPlayer.vocation]?.[selectedPlayer.sex.toLowerCase()] ||
        "https://media.giphy.com/media/ya4eevXU490Iw/giphy.gif";

    const currentList =
        activeTab === "bosses"
            ? (selectedPlayer.data?.bosses as BossEntry[] || [])
            : (selectedPlayer.data?.[activeTab] as string[] || []);

    const close = () => setSelectedPlayer(null);

    const refreshSelectedPlayer = (members: GuildMember[]) => {
        setSelectedPlayer(members.find((m) => m.name === selectedPlayer.name) || null);
    };

    // Añadir subitem a boss o quest
    const addSubItemToEntry = (entryName: string, subItem: string) => {
        if (!subItem.trim()) return;
        const trimmedSubItem = subItem.trim();

        const alreadyExists = allMembers.some((m) => {
            const list = m.data?.[activeTab];
            if (!list) return false;
            if (activeTab === "bosses") {
                return (list as BossEntry[]).some((entry) => entry.name === entryName && entry.subItems.includes(trimmedSubItem));
            }
            if (activeTab === "quests") {
                // Para quests, si quieres manejar subItems igual que bosses, deben ser objetos con subItems, si no, esto no aplicaría.
                const questEntry = (list as any[]).find((q) => q.name === entryName);
                if (!questEntry) return false;
                return questEntry.subItems?.includes(trimmedSubItem);
            }
            return false;
        });
        if (alreadyExists) {
            alert("Este subitem ya está agregado para este ítem.");
            return;
        }

        const updatedMembers = allMembers.map((member) => {
            if (!member.data) return member;

            if (activeTab === "bosses") {
                const updatedEntries = (member.data.bosses || []).map((b) =>
                    b.name === entryName ? { ...b, subItems: [...b.subItems, trimmedSubItem] } : b
                );
                return {
                    ...member,
                    data: {
                        ...member.data,
                        bosses: updatedEntries,
                    },
                };
            } else if (activeTab === "quests") {
                // Asumimos que quests también tienen subItems como bosses (debes adaptar estructura si no)
                const updatedEntries = (member.data.quests || []).map((q: any) =>
                    q.name === entryName ? { ...q, subItems: [...(q.subItems || []), trimmedSubItem] } : q
                );
                return {
                    ...member,
                    data: {
                        ...member.data,
                        quests: updatedEntries,
                    },
                };
            }
            return member;
        });

        setAllMembers(updatedMembers);
        refreshSelectedPlayer(updatedMembers);
    };

    // Remover subitem (bosses o quests)
    const removeSubItem = (entryName: string, subItem: string) => {
        const isCheckedByAnyone = Object.values(checkedItems).some(
            (playerItems) => playerItems?.[activeTab]?.[`${entryName}::${subItem}`]
        );
        if (isCheckedByAnyone) {
            alert("No se puede eliminar este subitem porque está marcado por algún jugador.");
            return;
        }

        const updatedMembers = allMembers.map((member) => {
            if (!member.data) return member;

            if (activeTab === "bosses") {
                const updatedEntries = (member.data.bosses || []).map((b) =>
                    b.name === entryName ? { ...b, subItems: b.subItems.filter((s) => s !== subItem) } : b
                );
                return {
                    ...member,
                    data: {
                        ...member.data,
                        bosses: updatedEntries,
                    },
                };
            } else if (activeTab === "quests") {
                const updatedEntries = (member.data.quests || []).map((q: any) =>
                    q.name === entryName ? { ...q, subItems: (q.subItems || []).filter((s: string) => s !== subItem) } : q
                );
                return {
                    ...member,
                    data: {
                        ...member.data,
                        quests: updatedEntries,
                    },
                };
            }
            return member;
        });

        setAllMembers(updatedMembers);
        refreshSelectedPlayer(updatedMembers);

        // Limpiar checkedItems para ese subitem
        const updatedChecked = { ...checkedItems };
        Object.keys(updatedChecked).forEach((playerName) => {
            if (updatedChecked[playerName]?.[activeTab]?.[`${entryName}::${subItem}`]) {
                delete updatedChecked[playerName][activeTab]![`${entryName}::${subItem}`];
            }
        });
        setCheckedItems(updatedChecked);
    };

    // Añadir item general
    const addItem = () => {
        if (!newItem.trim()) return;

        const trimmedItem = newItem.trim();

        if (activeTab === "chares") {
            if ((currentList as string[]).some((item) => item.toLowerCase() === trimmedItem.toLowerCase())) {
                alert("Este chare ya está agregado.");
                return;
            }

            // Agregamos sin validar que sea miembro
            const updatedMembers = allMembers.map((member) =>
                member.name === selectedPlayer.name
                    ? {
                        ...member,
                        data: {
                            bosses: member.data?.bosses || [],
                            quests: member.data?.quests || [],
                            chares: [...(member.data?.chares || []), trimmedItem],
                            notas: member.data?.notas || [],
                        },
                    }
                    : member
            );

            setAllMembers(updatedMembers);
            refreshSelectedPlayer(updatedMembers);
            setNewItem("");
            setShowSuggestions(false);
        }
        else if (activeTab === "bosses") {
            if ((currentList as BossEntry[]).some((b) => b.name.toLowerCase() === trimmedItem.toLowerCase())) {
                alert("Este boss ya está agregado.");
                return;
            }

            const updatedMembers = allMembers.map((member) => ({
                ...member,
                data: {
                    ...member.data,
                    bosses: [...(member.data?.bosses || []), { name: trimmedItem, subItems: [] }],
                    quests: member.data?.quests || [],
                    chares: member.data?.chares || [],
                    notas: member.data?.notas || [],
                },
            }));

            setAllMembers(updatedMembers);
            refreshSelectedPlayer(updatedMembers);
            setNewItem("");
        } else if (activeTab === "quests") {
            // Aquí asumimos quests con subItems igual que bosses
            if ((currentList as any[]).some((q) => q.name.toLowerCase() === trimmedItem.toLowerCase())) {
                alert("Esta quest ya está agregada.");
                return;
            }

            const updatedMembers = allMembers.map((member) => ({
                ...member,
                data: {
                    ...member.data,
                    quests: [...(member.data?.quests || []), { name: trimmedItem, subItems: [] }],
                    bosses: member.data?.bosses || [],
                    chares: member.data?.chares || [],
                    notas: member.data?.notas || [],
                },
            }));

            setAllMembers(updatedMembers);
            refreshSelectedPlayer(updatedMembers);
            setNewItem("");
        } else {
            if ((currentList as string[]).some((item) => item.toLowerCase() === trimmedItem.toLowerCase())) {
                alert(`Este ${activeTab} ya está agregado.`);
                return;
            }

            const updatedMembers = allMembers.map((member) =>
                member.name === selectedPlayer.name
                    ? {
                        ...member,
                        data: {
                            bosses: member.data?.bosses || [],
                            quests: member.data?.quests || [],
                            chares: member.data?.chares || [],
                            notas: [...(member.data?.notas || []), trimmedItem],
                        },
                    }
                    : member
            );

            setAllMembers(updatedMembers);
            refreshSelectedPlayer(updatedMembers);
            setNewItem("");
        }
    };

    // Remover item
    const removeItem = (item: string) => {
        if (activeTab === "bosses" || activeTab === "quests") {
            const isCheckedByAnyone = Object.values(checkedItems).some(
                (playerItems) => playerItems?.[activeTab]?.[item]
            );
            if (isCheckedByAnyone) {
                alert("No se puede eliminar este ítem porque está marcado por algún jugador.");
                return;
            }
        }

        const updatedMembers = allMembers.map((member) => {
            if (!member.data) return member;

            if (activeTab === "bosses" || activeTab === "quests") {
                const list = member.data[activeTab] || [];

                const updatedList =
                    activeTab === "bosses"
                        ? (list as BossEntry[]).filter((i) => i.name !== item)
                        : (list as any[]).filter((i) => i.name !== item);

                return {
                    ...member,
                    data: {
                        ...member.data,
                        [activeTab]: updatedList,
                    },
                };
            } else {
                if (member.name !== selectedPlayer?.name) return member;

                const updatedList = (member.data[activeTab] || []).filter((i: string) => i !== item);

                return {
                    ...member,
                    data: {
                        ...member.data,
                        [activeTab]: updatedList,
                    },
                };
            }
        });

        setAllMembers(updatedMembers);
        refreshSelectedPlayer(updatedMembers);

        if (activeTab === "bosses" || activeTab === "quests") {
            const updatedChecked = { ...checkedItems };
            Object.keys(updatedChecked).forEach((playerName) => {
                if (updatedChecked[playerName]?.[activeTab]?.[item]) {
                    delete updatedChecked[playerName][activeTab]![item];
                }
            });
            setCheckedItems(updatedChecked);
        }
    };

    const getLevelOneWeekAgo = (history: { date: string; level: number }[]): number | null => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Busca la entrada más reciente antes de hace 7 días
        const sorted = history
            .filter((entry) => new Date(entry.date) <= oneWeekAgo)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return sorted.length > 0 ? sorted[0].level : null;
    };

    const filteredSuggestions =
        activeTab === "chares" && newItem.trim()
            ? allMembers
                .filter(
                    (m) =>
                        m.name.toLowerCase().includes(newItem.trim().toLowerCase()) &&
                        m.name !== selectedPlayer.name &&
                        !(currentList as string[]).includes(m.name)
                )
                .map((m) => m.name)
                .slice(0, 5)
            : [];

    const onSuggestionClick = (name: string) => {
        setNewItem(name);
        setShowSuggestions(false);
    };

    const SuggestionsPortal = () => {
        if (!inputPosition) return null;
        return createPortal(
            <ul
                id="suggestions-portal"
                className="bg-white border rounded shadow max-h-40 overflow-y-auto"
                style={{
                    position: "absolute",
                    top: inputPosition.top,
                    left: inputPosition.left,
                    width: inputPosition.width,
                    zIndex: 9999,
                }}
            >
                {filteredSuggestions.map((name) => (
                    <li
                        key={name}
                        className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                        onMouseDown={() => onSuggestionClick(name)}
                    >
                        {name}
                    </li>
                ))}
            </ul>,
            document.body
        );
    };

    const AddSubItemInput: React.FC<{ entryName: string }> = ({ entryName }) => {
        const [subItemName, setSubItemName] = useState("");

        const onAdd = () => {
            if (!subItemName.trim()) return;
            addSubItemToEntry(entryName, subItemName.trim());
            setSubItemName("");
            closeInputForEntry(entryName);
        };

        if (!openSubItemInputs[entryName]) {
            return (
                <button
                    onClick={() => openInputForEntry(entryName)}
                    className="ml-6 mb-2 text-blue-600 hover:underline text-sm"
                >
                    + Agregar subitem
                </button>
            );
        }

        return (
            <div className="flex space-x-2 items-center ml-6 mb-2">
                <input
                    type="text"
                    value={subItemName}
                    onChange={(e) => setSubItemName(e.target.value)}
                    placeholder="Agregar subitem"
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onAdd();
                        } else if (e.key === "Escape") {
                            closeInputForEntry(entryName);
                        }
                    }}
                    autoFocus
                />
                <button onClick={onAdd} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                    +
                </button>
                <button
                    onClick={() => closeInputForEntry(entryName)}
                    className="text-gray-500 px-2 py-1 rounded hover:bg-gray-200"
                    title="Cancelar"
                >
                    ✕
                </button>
            </div>
        );
    };
    const levelOneWeekAgo = selectedPlayer.levelHistory ? getLevelOneWeekAgo(selectedPlayer.levelHistory) : null;
    const levelDiff = levelOneWeekAgo !== null ? selectedPlayer.level - levelOneWeekAgo : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 ">
            <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                        <div>
                            <h3 className="text-lg font-bold pb-1">{selectedPlayer.name}</h3>
                            <p>
                                <span className="font-bold">Lvl: </span>
                                {selectedPlayer.level}
                                {levelDiff !== null && levelDiff > 0 && (
                                    <span className="ml-2 text-green-600 font-semibold">+{levelDiff} en 7 días</span>
                                )}
                            </p>
                            <p>
                                <span className="font-bold">Vocation: </span>
                                {selectedPlayer.vocation}
                            </p>
                            <p>
                                <span className="font-bold">Status: </span>
                                <span
                                    className={`${selectedPlayer.status.toLowerCase() === "online" ? "text-green-600" : "text-gray-700"
                                        }`}
                                >
                                    {selectedPlayer.status}
                                </span>
                            </p>

                        </div>
                        <img src={vocationGifUrl} alt="Vocation gif" className="w-20 h-20 ml-4 object-contain" />
                    </div>
                    <button
                        className="text-gray-600 hover:text-black self-start"
                        onClick={close}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {selectedPlayer.deaths && selectedPlayer.deaths.length > 0 && (
                    <div className="bg-white mb-4">
                        <h4 className="text-md font-bold mb-2">
                            {selectedPlayer.deaths.length === 1 ? "murió recientemente:" : "murió varias veces recientemente:"}
                        </h4>
                        <ul className="space-y-1 text-sm max-h-20 overflow-y-auto">
                            {selectedPlayer.deaths.map((death, idx) => (
                                <li key={idx} className="border-b pb-1">
                                    <div className="text-gray-700">
                                        <span className="font-semibold">Nivel:</span> {death.level}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-semibold">Fecha:</span> {new Date(death.time).toLocaleString()}
                                    </div>
                                    <div className="text-gray-700">
                                        <span className="font-semibold">Razón:</span> {death.reason}
                                    </div>
                                </li>
                            ))}
                        </ul>

                    </div>

                )}

                {/* Tabs */}
                <div className="flex space-x-2 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`px-3 py-1 rounded capitalize ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                            onClick={() => {
                                setActiveTab(tab);
                                setNewItem("");
                                setShowSuggestions(false);
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Lista de ítems con checkboxes y subitems */}
                <ul className="mb-2 max-h-64 overflow-y-auto">
                    {(activeTab === "bosses" || activeTab === "quests") &&
                        (currentList as BossEntry[]).map((entry) => (
                            <li key={entry.name} className="border-b py-1">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={checkedItems[selectedPlayer.name]?.[activeTab]?.[entry.name] || false}
                                            onChange={(e) => {
                                                setCheckedItems((prev) => ({
                                                    ...prev,
                                                    [selectedPlayer.name]: {
                                                        ...prev[selectedPlayer.name],
                                                        [activeTab]: {
                                                            ...prev[selectedPlayer.name]?.[activeTab],
                                                            [entry.name]: e.target.checked,
                                                        },
                                                    },
                                                }));
                                            }}
                                        />
                                        <span className="font-semibold">{entry.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removeItem(entry.name)}
                                        className="text-red-500 hover:underline text-sm"
                                        title={`Eliminar ${activeTab.slice(0, -1)}`}
                                    >
                                        Eliminar
                                    </button>
                                </div>

                                {/* Subitems */}
                                <ul className="ml-6 mb-2">
                                    {entry.subItems.map((sub) => (
                                        <li key={sub} className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedItems[selectedPlayer.name]?.[activeTab]?.[`${entry.name}::${sub}`] || false}
                                                    onChange={(e) => {
                                                        setCheckedItems((prev) => ({
                                                            ...prev,
                                                            [selectedPlayer.name]: {
                                                                ...prev[selectedPlayer.name],
                                                                [activeTab]: {
                                                                    ...prev[selectedPlayer.name]?.[activeTab],
                                                                    [`${entry.name}::${sub}`]: e.target.checked,
                                                                },
                                                            },
                                                        }));
                                                    }}
                                                />
                                                <span>{sub}</span>
                                            </div>
                                            <button
                                                onClick={() => removeSubItem(entry.name, sub)}
                                                className="text-red-500 hover:underline text-sm"
                                                title="Eliminar subitem"
                                            >
                                                Eliminar
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Input para agregar subitems (ahora oculto y controlado) */}
                                <AddSubItemInput entryName={entry.name} />
                            </li>
                        ))}

                    {/* chares y notas siguen igual */}
                    {activeTab === "chares" &&
                        (currentList as string[]).map((item) => {
                            const isMember = allMembers.some((m) => m.name === item);

                            return (
                                <li key={item} className="flex justify-between items-center border-b py-1">
                                    <div className="flex items-center space-x-2">
                                        {isMember ? (
                                            <button
                                                className="text-blue-600 underline hover:text-blue-800"
                                                onClick={() => {
                                                    const player = allMembers.find((m) => m.name === item);
                                                    if (player) setSelectedPlayer(player);
                                                }}
                                            >
                                                {item}
                                            </button>
                                        ) : (
                                            <span className="text-gray-700 cursor-default">{item}</span>
                                        )}
                                    </div>
                                    <button onClick={() => removeItem(item)} className="text-red-500 hover:underline text-sm">
                                        Eliminar
                                    </button>
                                </li>
                            );
                        })}


                    {activeTab === "notas" &&
                        (currentList as string[]).map((item) => (
                            <li key={item} className="flex justify-between items-center border-b py-1">
                                <span>{item}</span>
                                <button onClick={() => removeItem(item)} className="text-red-500 hover:underline text-sm">
                                    Eliminar
                                </button>
                            </li>
                        ))}
                </ul>

                {/* Input con sugerencias para agregar item */}
                <div className="relative flex space-x-2 mb-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newItem}
                        onChange={(e) => {
                            setNewItem(e.target.value);
                            if (activeTab === "chares") setShowSuggestions(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 150);
                        }}
                        className="flex-1 border rounded px-2 py-1"
                        placeholder={`Agregar ${activeTab}`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addItem();
                            }
                        }}
                    />
                    <button onClick={addItem} className="bg-green-500 text-white px-3 py-1 rounded">
                        Agregar
                    </button>
                </div>
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && <SuggestionsPortal />}
        </div>
    );
};

export default PlayerModal;
