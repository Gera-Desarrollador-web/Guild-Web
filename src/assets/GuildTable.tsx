import React, { useEffect, useState, useMemo } from "react";

type GuildMember = {
    name: string;
    level: number;
    vocation: string;
    status: string;
    categories: {
        [categoryName: string]: string[]; // <- NO permite undefined
    };
};

const GuildTable: React.FC = () => {
    const guildName = "Twenty Thieves";

    const [allMembers, setAllMembers] = useState<GuildMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showOnlyOnline, setShowOnlyOnline] = useState(false);
    const [sortBy, setSortBy] = useState("name");
    const [questFilter, setQuestFilter] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState<GuildMember | null>(null);

    // Para inputs nuevos en modal (items por categoría)
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryItems, setNewCategoryItems] = useState<{ [cat: string]: string }>({});

    const [checkedItems, setCheckedItems] = useState<{
        [playerName: string]: {
            [categoryName: string]: {
                [itemName: string]: boolean;
            };
        };
    }>({});


    // Fetch data
    const fetchGuildData = async () => {
        setLoading(true);
        setError("");
        let members: GuildMember[] = [];
        try {
            const url = `https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`;
            const res = await fetch(url);
            const data = await res.json();
            members = data.guild.members || [];
            setAllMembers(members);

            // Inicializa checkedItems para todos los miembros
            const initChecked: typeof checkedItems = {};
            members.forEach(member => {
                initChecked[member.name] = {};
                if (member.categories) {
                    Object.entries(member.categories).forEach(([cat, items]) => {
                        initChecked[member.name][cat] = {};
                        items.forEach(item => {
                            initChecked[member.name][cat][item] = false;
                        });
                    });
                }
            });
            setCheckedItems(initChecked);

        } catch (err) {
            setError("Error al cargar los datos de la guild.");
            setAllMembers([]);
            setCheckedItems({});
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchGuildData();
    }, []);

    // Filtrado y orden
    const filteredMembers = useMemo(() => {
        let members = showOnlyOnline
            ? allMembers.filter((m) => m.status.toLowerCase() === "online")
            : [...allMembers];

        if (questFilter.trim()) {
            const filter = questFilter.toLowerCase();

            members = members.filter((member) => {
                if (!member.categories) return false;

                // Busca en las categorías y items si alguno coincide con el filtro y está palomeado
                return Object.entries(member.categories).some(([cat, items]) =>
                    items.some((item) => {
                        const matchesFilter = item.toLowerCase().includes(filter);
                        const isChecked =
                            checkedItems[member.name]?.[cat]?.[item] === true;
                        return matchesFilter && isChecked;
                    })
                );
            });
        }


        members = [...members];

        members.sort((a, b) => {
            if (sortBy === "level") return b.level - a.level;
            if (sortBy === "vocation") return a.vocation.localeCompare(b.vocation);
            if (sortBy === "status") return a.status.localeCompare(b.status);
            return a.name.localeCompare(b.name);
        });

        return members;
    }, [allMembers, showOnlyOnline, questFilter, sortBy]);




    // Agregar una nueva categoría al jugador seleccionado
    const addNewCategory = () => {
        if (!selectedPlayer || !newCategoryName.trim()) return;

        const category = newCategoryName.trim();

        // Agrega la categoría a TODOS los miembros, solo si no la tienen aún
        setAllMembers((prev) =>
            prev.map((member) =>
                member.name === selectedPlayer.name
                    ? {
                        ...member,
                        categories: Object.fromEntries(
                            Object.entries(member.categories || {}).filter(
                                ([_, items]) => Array.isArray(items) && items.length > 0
                            )
                        )
                    }
                    : member
            )
        );

        // Actualiza la copia local del jugador seleccionado para que tenga la categoría también
        setSelectedPlayer((prev) =>
            prev
                ? {
                    ...prev,
                    categories: {
                        ...prev.categories,
                        [category]: prev.categories?.[category] || [],
                    },
                }
                : null
        );

        setNewCategoryName("");
    };





    // Agregar item a una categoría para el jugador seleccionado
    const addItemToCategory = (category: string) => {
        if (!selectedPlayer) return;
        const newItem = (newCategoryItems[category] || "").trim();
        if (!newItem) return;

        setAllMembers((prev) =>
            prev.map((member) => {
                const currentItems = member.categories?.[category] || [];
                if (currentItems.includes(newItem)) return member; // Evitar duplicados

                return {
                    ...member,
                    categories: {
                        ...member.categories,
                        [category]: [...currentItems, newItem],
                    },
                };
            })
        );

        setCheckedItems((prev) => {
            const newChecked = { ...prev };
            Object.keys(newChecked).forEach(player => {
                if (!newChecked[player][category]) newChecked[player][category] = {};
                newChecked[player][category][newItem] = false;
            });
            return newChecked;
        });

        setSelectedPlayer((prev) =>
            prev
                ? {
                    ...prev,
                    categories: {
                        ...prev.categories,
                        [category]: [...(prev.categories?.[category] || []), newItem],
                    },
                }
                : null
        );

        setNewCategoryItems((prev) => ({ ...prev, [category]: "" }));
    };


    // Borrar item de categoría para jugador seleccionado
    const removeItemFromCategory = (category: string, index: number) => {
        if (!selectedPlayer) return;
        const itemToRemove = selectedPlayer.categories?.[category]?.[index];
        if (!itemToRemove) return;

        if (!canRemoveItem(category, itemToRemove)) {
            alert(`No se puede eliminar el ítem "${itemToRemove}" porque está palomeado por algún miembro.`);
            return;
        }

        setAllMembers((prev) =>
            prev.map((member) => ({
                ...member,
                categories: {
                    ...member.categories,
                    [category]: member.categories?.[category].filter((_, i) => i !== index),
                },
            }))
        );

        setCheckedItems((prev) => {
            const newChecked = { ...prev };
            Object.keys(newChecked).forEach(player => {
                if (newChecked[player][category]) {
                    const { [itemToRemove]: _, ...rest } = newChecked[player][category];
                    newChecked[player][category] = rest;
                }
            });
            return newChecked;
        });

        setSelectedPlayer((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                categories: {
                    ...prev.categories,
                    [category]: prev.categories?.[category].filter((_, i) => i !== index),
                },
            };
        });
    };

    const removeCategory = (category: string) => {
        if (!selectedPlayer) return;

        if (!canRemoveCategory(category)) {
            alert(`No se puede eliminar la categoría "${category}" porque tiene ítems palomeados.`);
            return;
        }

        // eliminar categoría para todos (similar a addNewCategory pero borrando)
        setAllMembers((prev) =>
            prev.map((member) => ({
                ...member,
                categories: Object.fromEntries(
                    Object.entries(member.categories || {}).filter(([key]) => key !== category)
                ),
            }))
        );

        setCheckedItems((prev) => {
            const newChecked = { ...prev };
            Object.keys(newChecked).forEach(player => {
                if (newChecked[player][category]) {
                    delete newChecked[player][category];
                }
            });
            return newChecked;
        });

        setSelectedPlayer((prev) =>
            prev
                ? {
                    ...prev,
                    categories: Object.fromEntries(
                        Object.entries(prev.categories || {}).filter(([key]) => key !== category)
                    ),
                }
                : null
        );
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

    const canRemoveItem = (category: string, item: string): boolean => {
        for (const playerName in checkedItems) {
            if (checkedItems[playerName]?.[category]?.[item]) {
                return false;
            }
        }
        return true;
    };

    const canRemoveCategory = (category: string): boolean => {
        for (const playerName in checkedItems) {
            if (checkedItems[playerName][category]) {
                for (const item in checkedItems[playerName][category]) {
                    if (checkedItems[playerName][category][item]) return false;
                }
            }
        }
        return true;
    };


    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-center">Miembros de {guildName}</h1>
            <div className="flex text-center text-gray-700 mb-4 items-center justify-center gap-4">
                <h2 className="text-black">Total: {allMembers.length}</h2>
                <p className="text-green-600">
                    Online: {allMembers.filter((m) => m.status.toLowerCase() === "online").length}
                </p>
                <p>
                    Offline: {allMembers.filter((m) => m.status.toLowerCase() !== "online").length}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showOnlyOnline}
                        onChange={(e) => setShowOnlyOnline(e.target.checked)}
                        className="accent-blue-500"
                    />
                    <span className="text-gray-700">Mostrar solo online</span>
                </label>

                <label className="text-gray-700">
                    Ordenar por:{" "}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="ml-2 border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="name">Nombre</option>
                        <option value="level">Nivel</option>
                        <option value="vocation">Vocación</option>
                        <option value="status">Estado</option>
                    </select>
                </label>

                <label className="text-gray-700">
                    Filtrar por quest:{" "}
                    <input
                        type="text"
                        value={questFilter}
                        onChange={(e) => setQuestFilter(e.target.value)}
                        placeholder="Nombre de la quest"
                        className="ml-2 border border-gray-300 rounded px-2 py-1"
                    />
                </label>
            </div>

            {loading && <p className="text-center">Cargando...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && filteredMembers.length > 0 && (
                <div className="overflow-x-auto max-w-full max-h-[600px]">
                    <table className="w-full table-auto border border-gray-300">
                        <thead className="bg-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="border px-4 py-2">Nombre</th>
                                <th className="border px-4 py-2">Nivel</th>
                                <th className="border px-4 py-2">Vocación</th>
                                <th className="border px-4 py-2">Estado</th>

                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((player) => (
                                <tr key={player.name} className="hover:bg-gray-100">
                                    <td
                                        className="border px-4 py-2 text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => setSelectedPlayer(player)}
                                    >
                                        {player.name}
                                    </td>
                                    <td className="border px-4 py-2">{player.level}</td>
                                    <td className="border px-4 py-2">{player.vocation}</td>
                                    <td className="border px-4 py-2">
                                        {player.status.toLowerCase() === "online" ? (
                                            <span className="text-green-600 font-semibold">Online</span>
                                        ) : (
                                            <span className="text-gray-500">Offline</span>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && filteredMembers.length === 0 && !error && (
                <p className="text-center">No hay jugadores para mostrar.</p>
            )}

            {/* Modal para jugador seleccionado */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setSelectedPlayer(null)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl font-bold"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-bold mb-4">{selectedPlayer.name}</h2>
                        <p>
                            <strong>Nivel:</strong> {selectedPlayer.level}
                        </p>
                        <p>
                            <strong>Vocación:</strong> {selectedPlayer.vocation}
                        </p>
                        <p>
                            <strong>Estado:</strong>{" "}
                            <span
                                className={
                                    selectedPlayer.status.toLowerCase() === "online"
                                        ? "text-green-600"
                                        : "text-gray-500"
                                }
                            >
                                {selectedPlayer.status}
                            </span>
                        </p>

                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Categorías</h3>

                            {selectedPlayer.categories ? (
                                Object.entries(selectedPlayer.categories).map(([cat, items]) => (
                                    <div key={cat} className="mb-4 border rounded p-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-semibold capitalize">{cat}</h4>
                                            <button
                                                className="text-red-500 text-sm hover:text-red-700"
                                                onClick={() => removeCategory(cat)}
                                            >
                                                Eliminar categoría
                                            </button>
                                        </div>

                                        <ul className="mb-2 max-h-32 overflow-y-auto">
                                            {items.map((item, i) => {
                                                const isChecked = checkedItems[selectedPlayer.name]?.[cat]?.[item] || false;
                                                return (
                                                    <li
                                                        key={i}
                                                        className="flex justify-between items-center py-1"
                                                        style={{ color: isChecked ? "green" : "red" }}
                                                    >
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleCheckItem(selectedPlayer.name, cat, item)}
                                                            />
                                                            <span>{item}</span>
                                                        </label>
                                                        <button
                                                            className="text-red-500 font-bold hover:text-red-700"
                                                            onClick={() => removeItemFromCategory(cat, i)}
                                                            aria-label={`Eliminar ${item} de ${cat}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder={`Agregar a ${cat}`}
                                                value={newCategoryItems[cat] || ""}
                                                onChange={(e) =>
                                                    setNewCategoryItems((prev) => ({
                                                        ...prev,
                                                        [cat]: e.target.value,
                                                    }))
                                                }
                                                className="border px-2 py-1 rounded flex-grow"
                                            />
                                            <button
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                onClick={() => addItemToCategory(cat)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No hay categorías aún.</p>
                            )}


                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-semibold mb-2">Agregar nueva categoría</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nombre categoría"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="border px-2 py-1 rounded flex-grow"
                                    />
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        onClick={addNewCategory}
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuildTable;
