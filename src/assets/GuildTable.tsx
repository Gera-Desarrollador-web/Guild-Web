import React, { useEffect, useState, useMemo } from "react";

type GuildMember = {
    name: string;
    level: number;
    vocation: string;
    status: string;
    quests?: string[];
};

const GuildTable: React.FC = () => {
    const guildName = "Twenty Thieves";
    const [allMembers, setAllMembers] = useState<GuildMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showOnlyOnline, setShowOnlyOnline] = useState(false);
    const [sortBy, setSortBy] = useState("name");
    const [editingQuest, setEditingQuest] = useState<string | null>(null);
    const [newQuest, setNewQuest] = useState("");
    const [questFilter, setQuestFilter] = useState("");

    const fetchGuildData = async () => {
        setLoading(true);
        setError("");
        try {
            const url = `https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`;
            const res = await fetch(url);
            const data = await res.json();
            const members: GuildMember[] = data.guild.members || [];
            setAllMembers(members);
        } catch (err) {
            setError("Error al cargar los datos de la guild.");
            setAllMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuildData();
    }, []);

    // Filtro
    const filteredMembers = useMemo(() => {
        let members = showOnlyOnline
            ? allMembers.filter((m) => m.status.toLowerCase() === "online")
            : [...allMembers];

        if (questFilter.trim()) {
            members = members.filter((member) =>
                member.quests?.some((q) =>
                    q.toLowerCase().includes(questFilter.toLowerCase())
                )
            );
        }

        members = [...members]; // importante para evitar mutaciones

        members.sort((a, b) => {
            if (sortBy === "level") return b.level - a.level;
            if (sortBy === "vocation") return a.vocation.localeCompare(b.vocation);
            if (sortBy === "status") return a.status.localeCompare(b.status);
            return a.name.localeCompare(b.name);
        });

        return members;
    }, [allMembers, showOnlyOnline, questFilter, sortBy]);


    //quest
    const handleAddQuest = (name: string) => {
        if (!newQuest.trim()) return;

        setAllMembers((prev) =>
            prev.map((member) =>
                member.name === name
                    ? {
                        ...member,
                        quests: [...(member.quests || []), newQuest.trim()],
                    }
                    : member
            )
        );
        setNewQuest("");
    };

    const handleRemoveQuest = (playerName: string, questIndex: number) => {
        setAllMembers((prev) =>
            prev.map((member) =>
                member.name === playerName
                    ? {
                        ...member,
                        quests: member.quests
                            ? member.quests.filter((_, i) => i !== questIndex)
                            : [],
                    }
                    : member
            )
        );
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-center">
                Miembros de {guildName}
            </h1>
            <div className="flex text-center text-gray-700 mb-4 text-align-center items-center justify-center gap-4">
                <h2 className="text-black">Total: {allMembers.length}</h2>
                <p className="text-green-600">Online: {allMembers.filter((m) => m.status.toLowerCase() === "online").length}</p>
                <p>Offline: {allMembers.filter((m) => m.status.toLowerCase() !== "online").length}</p>
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
                <div className="overflor-x-hidden overflow-y-auto max-w-full h-150">
                    <table className="w-full table-auto border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border px-4 py-2">Nombre</th>
                                <th className="border px-4 py-2">Nivel</th>
                                <th className="border px-4 py-2">Vocación</th>
                                <th className="border px-4 py-2">Estado</th>
                                <th className="border px-4 py-2">Quest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((player) => (
                                <tr key={player.name} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2">{player.name}</td>
                                    <td className="border px-4 py-2">{player.level}</td>
                                    <td className="border px-4 py-2">{player.vocation}</td>
                                    <td className="border px-4 py-2">
                                        {player.status.toLowerCase() === "online" ? (
                                            <span className="text-green-600 font-semibold">Online</span>
                                        ) : (
                                            <span className="text-gray-500">Offline</span>
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {editingQuest === player.name ? (
                                            <div className="flex flex-col  items-center">
                                                <ul className="list-none pl-4 text-sm text-gray-800">
                                                    {(player.quests || []).map((q, i) => (
                                                        <li key={i}>{q}</li>
                                                    ))}
                                                </ul>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newQuest}
                                                        onChange={(e) => setNewQuest(e.target.value)}
                                                        className="border px-2 py-1 rounded w-full"
                                                        placeholder="Nueva quest"
                                                    />
                                                    <button
                                                        onClick={() => handleAddQuest(player.name)}
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingQuest(null)}
                                                        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                                                    >
                                                        Cerrar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full text-center">
                                                <ul className="text-sm text-gray-800 w-full max-w-[220px]">
                                                    {(player.quests || []).map((q, i) => (
                                                        <li key={i} className="flex items-center justify-between gap-4 py-1 border-b">
                                                            <span className="truncate">{q}</span>
                                                            <button
                                                                onClick={() => handleRemoveQuest(player.name, i)}
                                                                className="text-red-500 hover:text-red-700 font-bold"
                                                                title="Eliminar quest"
                                                            >
                                                                ×
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <button
                                                    onClick={() => {
                                                        setEditingQuest(player.name);
                                                        setNewQuest("");
                                                    }}
                                                    className=" text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Agregar Quest
                                                </button>
                                            </div>

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
        </div>
    );
};

export default GuildTable;
