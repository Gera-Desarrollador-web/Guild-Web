import React, { useState, useRef, useEffect } from "react";
import { BossEntry, GuildMember } from "../../types";
import { PlayerInfo } from "./PlayerInfo";
import { DeathList } from "./DeathList";
import { TabNavigation } from "./TabNavigation";
import { BossQuestList } from "./BossQuestList";
import { SimpleItemList } from "./SimpleItemList";
import { AddItemForm } from "./AddItemForm";

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

const timeZones = [
    { code: "MX", label: "México", timeZone: "America/Mexico_City" },
    { code: "CO", label: "Colombia", timeZone: "America/Bogota" },
    { code: "BR", label: "Brasil", timeZone: "America/Sao_Paulo" },
    { code: "ES", label: "España", timeZone: "Europe/Madrid" },
    { code: "US", label: "EE.UU", timeZone: "America/New_York" },
    { code: "UTC", label: "UTC", timeZone: "UTC" },
];

const PlayerModal: React.FC<Props> = ({
    selectedPlayer,
    setSelectedPlayer,
    allMembers,
    setAllMembers,
    checkedItems,
    setCheckedItems,
}) => {
    const [activeTab, setActiveTab] = useState<"bosses" | "quests" | "chares" | "notas">("bosses");
    const [newItem, setNewItem] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputPosition, setInputPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedTimeZone, setSelectedTimeZone] = useState(timeZones[0]);
    const modalRef = useRef<HTMLDivElement>(null);
    const [editingItem, setEditingItem] = useState<{
        name: string,
        originalName: string,
        isNew?: boolean
    } | null>(null);
    const [editingSubItem, setEditingSubItem] = useState<{
        parentItem: string;
        subItem: string;
        originalSubItem: string;
    } | null>(null);

    useEffect(() => {
        if (!selectedPlayer) return;
        const found = timeZones.find((z) => z.timeZone === selectedPlayer.timeZone);
        setSelectedTimeZone(found || timeZones[0]);
    }, [selectedPlayer?.timeZone]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (modalRef.current &&
                !modalRef.current.contains(target) &&
                !target.closest('.suggestions-container')) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!selectedPlayer) return null;

    const getLevelOneWeekAgo = (history: { date: string; level: number }[]): number | null => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const sorted = history
            .filter((entry) => new Date(entry.date) <= oneWeekAgo)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return sorted.length > 0 ? sorted[0].level : null;
    };

    const levelOneWeekAgo = selectedPlayer.levelHistory ? getLevelOneWeekAgo(selectedPlayer.levelHistory) : null;
    const levelDiff = levelOneWeekAgo !== null ? selectedPlayer.level - levelOneWeekAgo : null;

    const currentList =
        activeTab === "bosses"
            ? (selectedPlayer.data?.bosses as BossEntry[] || [])
            : (selectedPlayer.data?.[activeTab] as string[] || []);

    const close = () => setSelectedPlayer(null);

    const refreshSelectedPlayer = (members: GuildMember[]) => {
        setSelectedPlayer(members.find((m) => m.name === selectedPlayer.name) || null);
    };

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

        const updatedChecked = { ...checkedItems };
        Object.keys(updatedChecked).forEach((playerName) => {
            if (updatedChecked[playerName]?.[activeTab]?.[`${entryName}::${subItem}`]) {
                delete updatedChecked[playerName][activeTab]![`${entryName}::${subItem}`];
            }
        });
        setCheckedItems(updatedChecked);
    };

    const addItem = () => {
        if (!newItem.trim()) return;

        const trimmedItem = newItem.trim();

        if (activeTab === "chares") {
            if ((currentList as string[]).some((item) => item.toLowerCase() === trimmedItem.toLowerCase())) {
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
                            chares: [
                                ...(member.data?.chares || []),
                                trimmedItem.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
                            ],
                            notas: member.data?.notas || [],
                        },
                    }
                    : member
            );

            setAllMembers(updatedMembers);
            refreshSelectedPlayer(updatedMembers);
            setNewItem("");
            setShowSuggestions(false);
        } else if (activeTab === "bosses" || activeTab === "quests") {
            if ((currentList as any[]).some((item) =>
                (item.name || item).toLowerCase() === trimmedItem.toLowerCase())) {
                alert(`Este ${activeTab.slice(0, -1)} ya está agregado.`);
                return;
            }

            const newEntry = { name: trimmedItem, subItems: [] };
            const updatedMembers = allMembers.map((member) => ({
                ...member,
                data: {
                    ...member.data,
                    [activeTab]: [...(member.data?.[activeTab] || []), newEntry],
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
                const updatedList = (list as any[]).filter((i) => i.name !== item);
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

    const startEditing = (itemName: string) => {
        setEditingItem({
            name: itemName,
            originalName: itemName,
            isNew: false
        });
        setNewItem(itemName);
    };

    const cancelEditing = () => {
        setEditingItem(null);
        setNewItem("");
    };

    const saveEditedItem = () => {
        if (!editingItem || !newItem.trim()) return;

        const trimmedName = newItem.trim();

        // Verificar si el nombre ya existe
        const nameExists = (currentList as any[]).some(item => {
            const currentName = activeTab === "bosses" || activeTab === "quests" ? item.name : item;
            return currentName.toLowerCase() === trimmedName.toLowerCase() &&
                currentName !== editingItem.originalName;
        });

        if (nameExists) {
            alert(`Este ${activeTab} ya existe.`);
            return;
        }

        // Actualizar los miembros
        const updatedMembers = allMembers.map(member => {
            if (!member.data) return member;

            if (activeTab === "bosses" || activeTab === "quests") {
                const updatedList = (member.data[activeTab] || []).map((item: any) => {
                    if (item.name === editingItem.originalName) {
                        // Actualizar checkedItems
                        const newCheckedItems = { ...checkedItems };
                        Object.keys(newCheckedItems).forEach(playerName => {
                            if (newCheckedItems[playerName]?.[activeTab]) {
                                // Actualizar subitems
                                item.subItems.forEach((subItem: string) => {
                                    const oldKey = `${editingItem.originalName}::${subItem}`;
                                    const newKey = `${trimmedName}::${subItem}`;

                                    if (newCheckedItems[playerName][activeTab]?.[oldKey]) {
                                        newCheckedItems[playerName][activeTab]![newKey] =
                                            newCheckedItems[playerName][activeTab]![oldKey];
                                        delete newCheckedItems[playerName][activeTab]![oldKey];
                                    }
                                });

                                // Actualizar item principal
                                if (newCheckedItems[playerName][activeTab]?.[editingItem.originalName]) {
                                    newCheckedItems[playerName][activeTab]![trimmedName] =
                                        newCheckedItems[playerName][activeTab]![editingItem.originalName];
                                    delete newCheckedItems[playerName][activeTab]![editingItem.originalName];
                                }
                            }
                        });
                        setCheckedItems(newCheckedItems);

                        return { ...item, name: trimmedName };
                    }
                    return item;
                });
                return {
                    ...member,
                    data: {
                        ...member.data,
                        [activeTab]: updatedList
                    }
                };
            } else {
                if (member.name !== selectedPlayer?.name) return member;
                const updatedList = (member.data[activeTab] || []).map((item: string) =>
                    item === editingItem.originalName ? trimmedName : item
                );
                return {
                    ...member,
                    data: {
                        ...member.data,
                        [activeTab]: updatedList
                    }
                };
            }
        });

        setAllMembers(updatedMembers);
        refreshSelectedPlayer(updatedMembers);
        setEditingItem(null);
        setNewItem("");
    };

    const startEditingSubItem = (parentItem: string, subItem: string) => {
        setEditingSubItem({
            parentItem,
            subItem,
            originalSubItem: subItem
        });
    };

    const cancelEditingSubItem = () => {
        setEditingSubItem(null);
    };

    const saveEditedSubItem = () => {
        if (!editingSubItem || !editingSubItem.subItem.trim()) return;

        const trimmedName = editingSubItem.subItem.trim();

        // Verificar si el subitem ya existe
        const subItemExists = allMembers.some(member => {
            const items = member.data?.[activeTab];
            if (!items) return false;

            return items.some((item: any) =>
                item.name === editingSubItem.parentItem &&
                item.subItems.includes(trimmedName) &&
                trimmedName !== editingSubItem.originalSubItem
            );
        });

        if (subItemExists) {
            alert("Este subitem ya existe para este ítem.");
            return;
        }

        // Actualizar los miembros
        const updatedMembers = allMembers.map(member => {
            if (!member.data) return member;

            const updatedList = (member.data[activeTab] || []).map((item: any) => {
                if (item.name === editingSubItem.parentItem) {
                    // Actualizar checkedItems
                    const newCheckedItems = { ...checkedItems };
                    Object.keys(newCheckedItems).forEach(playerName => {
                        if (newCheckedItems[playerName]?.[activeTab]) {
                            const oldKey = `${editingSubItem.parentItem}::${editingSubItem.originalSubItem}`;
                            const newKey = `${editingSubItem.parentItem}::${trimmedName}`;

                            if (newCheckedItems[playerName][activeTab]?.[oldKey]) {
                                newCheckedItems[playerName][activeTab]![newKey] =
                                    newCheckedItems[playerName][activeTab]![oldKey];
                                delete newCheckedItems[playerName][activeTab]![oldKey];
                            }
                        }
                    });
                    setCheckedItems(newCheckedItems);

                    return {
                        ...item,
                        subItems: item.subItems.map((s: string) =>
                            s === editingSubItem.originalSubItem ? trimmedName : s
                        )
                    };
                }
                return item;
            });

            return {
                ...member,
                data: {
                    ...member.data,
                    [activeTab]: updatedList
                }
            };
        });

        setAllMembers(updatedMembers);
        refreshSelectedPlayer(updatedMembers);
        setEditingSubItem(null);
    };

    const handleSubItemChange = (value: string) => {
        if (editingSubItem) {
            setEditingSubItem({
                ...editingSubItem,
                subItem: value
            });
        }
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
        if (!selectedPlayer) return;

        // Verificar contra la lista actual de chares
        const currentChares = selectedPlayer.data?.chares || [];
        if (currentChares.some(c => c.toLowerCase() === name.toLowerCase())) {
            alert("Este personaje ya está agregado");
            return;
        }

        // Formatear nombre (primera letra mayúscula)
        const formattedName = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

        // Actualizar miembros
        const updatedMembers = allMembers.map(member => {
            if (member.name === selectedPlayer.name) {
                return {
                    ...member,
                    data: {
                        ...member.data,
                        bosses: member.data?.bosses || [],
                        quests: member.data?.quests || [],
                        chares: [...currentChares, formattedName],
                        notas: member.data?.notas || []
                    }
                };
            }
            return member;
        });

        setAllMembers(updatedMembers);

        // Actualizar el jugador seleccionado con los nuevos datos
        const updatedPlayer = updatedMembers.find(m => m.name === selectedPlayer.name);
        if (updatedPlayer) {
            setSelectedPlayer({
                ...updatedPlayer,
                data: {
                    ...updatedPlayer.data,
                    bosses: updatedPlayer.data?.bosses || [],
                    quests: updatedPlayer.data?.quests || [],
                    chares: updatedPlayer.data?.chares || [],
                    notas: updatedPlayer.data?.notas || []
                }
            });
        }

        setShowSuggestions(false);
        setNewItem("");
    };
    const handleTimeZoneChange = (code: string) => {
        const newZone = timeZones.find((z) => z.code === code);
        if (!newZone || !selectedPlayer) return;

        setSelectedTimeZone(newZone);
        setAllMembers((prev) => {
            const updatedMembers = prev.map((member) =>
                member.name === selectedPlayer.name ? { ...member, timeZone: newZone.timeZone } : member
            );
            const updatedPlayer = updatedMembers.find((m) => m.name === selectedPlayer.name) || null;
            setSelectedPlayer(updatedPlayer);
            return updatedMembers;
        });
    };

    const getCheckedItemsForPlayer = () => {
        return checkedItems[selectedPlayer.name]?.[activeTab] || {};
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="relative bg-[#2d1a0f] border-4 border-[#5d3b1e] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <button
                    className="absolute right-2 text-[#c4a97a] hover:text-[#e8d5b5] text-2xl font-bold z-10"
                    onClick={close}
                    aria-label="Cerrar modal"
                >
                    ×
                </button>

                <div className="p-6">
                    <PlayerInfo
                        selectedPlayer={selectedPlayer}
                        selectedTimeZone={selectedTimeZone}
                        timeZones={timeZones}
                        onTimeZoneChange={handleTimeZoneChange}
                        levelDiff={levelDiff}
                    />

                    {selectedPlayer.deaths && <DeathList deaths={selectedPlayer.deaths} />}

                    <TabNavigation
                        activeTab={activeTab}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setNewItem("");
                            setShowSuggestions(false);
                            setEditingItem(null);
                            setEditingSubItem(null);
                        }}
                    />

                    <div className="mt-4">
                        {activeTab === "bosses" || activeTab === "quests" ? (
                            <BossQuestList
                                items={currentList as BossEntry[]}
                                activeTab={activeTab}
                                checkedItems={getCheckedItemsForPlayer()}
                                playerName={selectedPlayer.name}
                                onItemCheck={(itemName, checked) => {
                                    setCheckedItems((prev) => ({
                                        ...prev,
                                        [selectedPlayer.name]: {
                                            ...prev[selectedPlayer.name],
                                            [activeTab]: {
                                                ...prev[selectedPlayer.name]?.[activeTab],
                                                [itemName]: checked,
                                            },
                                        },
                                    }));
                                }}
                                onSubItemCheck={(itemName, subItem, checked) => {
                                    setCheckedItems((prev) => ({
                                        ...prev,
                                        [selectedPlayer.name]: {
                                            ...prev[selectedPlayer.name],
                                            [activeTab]: {
                                                ...prev[selectedPlayer.name]?.[activeTab],
                                                [`${itemName}::${subItem}`]: checked,
                                            },
                                        },
                                    }));
                                }}
                                onRemoveItem={removeItem}
                                onRemoveSubItem={removeSubItem}
                                onAddSubItem={addSubItemToEntry}
                                onEditItem={startEditing}
                                onEditSubItem={startEditingSubItem}
                                editingSubItem={editingSubItem}
                                onSubItemChange={handleSubItemChange}
                                onSaveSubItemEdit={saveEditedSubItem}
                                onCancelSubItemEdit={cancelEditingSubItem}
                            />
                        ) : (
                            <SimpleItemList
                                items={currentList as string[]}
                                allMembers={allMembers}
                                onItemClick={(name) => {
                                    const player = allMembers.find((m) => m.name === name);
                                    if (player) setSelectedPlayer(player);
                                }}
                                onRemoveItem={removeItem}
                                onEditItem={startEditing}
                                activeTab={activeTab}
                            />
                        )}
                    </div>

                    <AddItemForm
                        activeTab={activeTab}
                        newItem={newItem}
                        filteredSuggestions={filteredSuggestions}
                        onNewItemChange={setNewItem}
                        onShowSuggestionsChange={setShowSuggestions}
                        onAddItem={addItem}
                        onEditItem={saveEditedItem}
                        onCancelEdit={cancelEditing}
                        inputPosition={inputPosition}
                        onSuggestionClick={onSuggestionClick}
                        isEditing={!!editingItem}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerModal;