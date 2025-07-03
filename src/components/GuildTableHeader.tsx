

type Props = {
    totalMembers: number;
    onlineCount: number;
    offlineCount: number;
    showOnlyOnline: boolean;
    setShowOnlyOnline: (v: boolean) => void;
    sortBy: string;
    setSortBy: (v: string) => void;
    questFilter: string;
    setQuestFilter: (v: string) => void;
};


const GuildTableHeader: React.FC<Props> = ({
    totalMembers,
    onlineCount,
    offlineCount,
    showOnlyOnline,
    setShowOnlyOnline,
    sortBy,
    setSortBy,
    questFilter,
    setQuestFilter,
}) => {
    return (
        <>
            <h1 className="text-3xl font-bold mb-4 text-center">Miembros de Twenty Thieves</h1>
            <div className="flex text-center text-gray-700 mb-4 items-center justify-center gap-4">
                <h2 className="text-black">Total: {totalMembers}</h2>
                <p className="text-green-600">Online: {onlineCount}</p>
                <p>Offline: {offlineCount}</p>
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
        </>
    );
};

export default GuildTableHeader;
