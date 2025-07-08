import React, { useState, useRef, useEffect } from "react";
import { BossEntry } from "../types";
import { createPortal } from "react-dom";
import { GuildMember } from "../types";

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

    const currentList = selectedPlayer.data?.[activeTab] || [];

    const close = () => setSelectedPlayer(null);

    const refreshSelectedPlayer = (members: GuildMember[]) => {
        setSelectedPlayer(members.find((m) => m.name === selectedPlayer.name) || null);
    };

    // Agrega un subitem a un boss
    const addSubItemToBoss = (bossName: string, subItem: string) => {
        if (!subItem.trim()) return;

        const trimmedSubItem = subItem.trim();

        // Verificar si ya existe el subitem en algún boss para todos los miembros (opcional, puedes quitar esta validación si quieres)
        const alreadyExists = allMembers.some((m) =>
            m.data?.bosses.some(
                (b) => b.name === bossName && b.subItems.includes(trimmedSubItem)
            )
        );
        if (alreadyExists) {
            alert("Este subitem ya está agregado para este boss.");
            return;
        }

        const updatedMembers = allMembers.map((member) => {
            if (!member.data) return member;

            const updatedBosses = (member.data.bosses || []).map((b) =>
                b.name === bossName
                    ? { ...b, subItems: [...b.subItems, trimmedSubItem] }
                    : b
            );

            return {
                ...member,
                data: {
                    ...member.data,
                    bosses: updatedBosses,
                },
            };
        });

        setAllMembers(updatedMembers);
        refreshSelectedPlayer(updatedMembers);
    };

    const removeSubItem = (bossName: string, subItem: string) => {
        // Validar si está marcado por alguien
        const isCheckedByAnyone = Object.values(checkedItems).some(
            (playerItems) =>
                playerItems?.bosses?.[`${bossName}::${subItem}`]
        );
        if (isCheckedByAnyone) {
            alert("No se puede eliminar este subitem porque está marcado por algún jugador.");
            return;
        }

        const updatedMembers = allMembers.map((member) => {
            if (!member.data) return member;

            const updatedBosses = (member.data.bosses || []).map((b) =>
                b.name === bossName
                    ? { ...b, subItems: b.subItems.filter((s) => s !== subItem) }
                    : b
            );

            return {
                ...member,
                data: {
                    ...member.data,
                    bosses: updatedBosses,
                },
            };
        });

        setAllMembers(updatedMembers);
        refreshSelectedPlayer(updatedMembers);

        // Limpiar checkedItems para ese subitem
        const updatedChecked = { ...checkedItems };
        Object.keys(updatedChecked).forEach((playerName) => {
            if (updatedChecked[playerName]?.bosses?.[`${bossName}::${subItem}`]) {
                delete updatedChecked[playerName].bosses![`${bossName}::${subItem}`];
            }
        });
        setCheckedItems(updatedChecked);
    };

    const addItem = () => {
        if (!newItem.trim()) return;

        const trimmedItem = newItem.trim();

        if (activeTab === "chares") {
            const isValidMember = allMembers.some(
                (m) => m.name.toLowerCase() === trimmedItem.toLowerCase()
            );
            if (!isValidMember) {
                alert("El nombre no corresponde a ningún miembro de la guild.");
                return;
            }

            if (currentList.some((item: string) => item.toLowerCase() === trimmedItem.toLowerCase())) {
                alert("Este chare ya está agregado.");
                return;
            }

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
        } else if (activeTab === "bosses") {
            if (
                allMembers.some((m) =>
                    m.data?.bosses.some((b) => b.name.toLowerCase() === trimmedItem.toLowerCase())
                )
            ) {
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
        }
        else {
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
                const updatedList = (member.data[activeTab] || []).filter((i: any) => {
                    if (activeTab === "bosses") {
                        return i.name !== item;
                    }
                    return i !== item;
                });
                return {
                    ...member,
                    data: {
                        ...member.data,
                        [activeTab]: updatedList,
                    },
                };
            } else {
                if (member.name !== selectedPlayer.name) return member;

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

    const filteredSuggestions =
        activeTab === "chares" && newItem.trim()
            ? allMembers
                .filter(
                    (m) =>
                        m.name.toLowerCase().includes(newItem.trim().toLowerCase()) &&
                        m.name !== selectedPlayer.name &&
                        !(currentList || []).includes(m.name)
                )
                .map((m) => m.name)
                .slice(0, 5)
            : [];

    const onSuggestionClick = (name: string) => {
        setNewItem(name);
        setShowSuggestions(false);
    };

    // Componente portal para la lista de sugerencias
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

    // Componente para input de subitems
    const AddSubItemInput: React.FC<{ bossName: string; addSubItemToBoss: (bossName: string, subItem: string) => void }> = ({
        bossName,
        addSubItemToBoss,
    }) => {
        const [subItemName, setSubItemName] = useState("");

        const onAdd = () => {
            if (!subItemName.trim()) return;
            addSubItemToBoss(bossName, subItemName.trim());
            setSubItemName("");
        };

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
                        }
                    }}
                />
                <button onClick={onAdd} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                    +
                </button>
            </div>
        );
    };

    const typedCurrentList = activeTab === "bosses"
        ? (currentList as BossEntry[])
        : (currentList as string[]);

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
                            </p>
                            <p>
                                <span className="font-bold">Vocation: </span>
                                {selectedPlayer.vocation}
                            </p>
                            <p>
                                <span className="font-bold">Status: </span>
                                <span
                                    className={`${selectedPlayer.status.toLowerCase() === "online"
                                            ? "text-green-600"
                                            : "text-gray-700"
                                        }`}
                                >
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

                {selectedPlayer.deaths && selectedPlayer.deaths.length > 0 && (
                    <div className="bg-white mb-4">
                        <h4 className="text-md font-bold mb-2">
                            {selectedPlayer.deaths.length === 1
                                ? "murió recientemente:"
                                : "murió varias veces recientemente:"}
                        </h4>
                        <ul className="space-y-1 text-sm max-h-20 overflow-y-auto">
                            {selectedPlayer.deaths.map((death, idx) => (
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

                {/* Tabs */}
                <div className="flex space-x-2 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`px-3 py-1 rounded capitalize ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
                                }`}
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
                    {activeTab === "bosses"
                        ? typedCurrentList.map((boss, index) => (
                            <li key={index} className="border-b py-1">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                checkedItems[selectedPlayer.name]?.bosses?.[boss.name] ||
                                                false
                                            }
                                            onChange={(e) => {
                                                setCheckedItems((prev) => ({
                                                    ...prev,
                                                    [selectedPlayer.name]: {
                                                        ...prev[selectedPlayer.name],
                                                        bosses: {
                                                            ...prev[selectedPlayer.name]?.bosses,
                                                            [boss.name]: e.target.checked,
                                                        },
                                                    },
                                                }));
                                            }}
                                        />
                                        <span className="font-semibold">{boss.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removeItem(boss.name)}
                                        className="text-red-500 hover:underline text-sm"
                                        title="Eliminar boss"
                                    >
                                        Eliminar
                                    </button>
                                </div>

                                {/* Subitems */}
                                <ul className="ml-6 mb-2">
                                    {boss.subItems.map((sub, subIndex) => (
                                        <li
                                            key={subIndex}
                                            className="flex justify-between items-center"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        checkedItems[selectedPlayer.name]?.bosses?.[
                                                        `${boss.name}::${sub}`
                                                        ] || false
                                                    }
                                                    onChange={(e) => {
                                                        setCheckedItems((prev) => ({
                                                            ...prev,
                                                            [selectedPlayer.name]: {
                                                                ...prev[selectedPlayer.name],
                                                                bosses: {
                                                                    ...prev[selectedPlayer.name]?.bosses,
                                                                    [`${boss.name}::${sub}`]: e.target.checked,
                                                                },
                                                            },
                                                        }));
                                                    }}
                                                />
                                                <span>{sub}</span>
                                            </div>
                                            <button
                                                onClick={() => removeSubItem(boss.name, sub)}
                                                className="text-red-500 hover:underline text-sm"
                                                title="Eliminar subitem"
                                            >
                                                Eliminar
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Input para agregar subitems */}
                                <AddSubItemInput
                                    bossName={boss.name}
                                    addSubItemToBoss={addSubItemToBoss}
                                />
                            </li>
                        ))
                        : typedCurrentList.map((item, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center border-b py-1"
                            >
                                <div className="flex items-center space-x-2">
                                    {activeTab === "quests" && (
                                        <input
                                            type="checkbox"
                                            checked={
                                                checkedItems[selectedPlayer.name]?.[activeTab]?.[item] ||
                                                false
                                            }
                                            onChange={(e) => {
                                                setCheckedItems((prev) => ({
                                                    ...prev,
                                                    [selectedPlayer.name]: {
                                                        ...prev[selectedPlayer.name],
                                                        [activeTab]: {
                                                            ...prev[selectedPlayer.name]?.[activeTab],
                                                            [item]: e.target.checked,
                                                        },
                                                    },
                                                }));
                                            }}
                                        />
                                    )}
                                    {activeTab === "chares" ? (
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
                                        <span>{item}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeItem(item)}
                                    className="text-red-500 hover:underline text-sm"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                </ul>

                {/* Input con sugerencias */}
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
                    <button
                        onClick={addItem}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                        Agregar
                    </button>
                </div>
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && <SuggestionsPortal />}
        </div>
    );

};

export default PlayerModal;
