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
    levelRange: string;
    setLevelRange: (v: string) => void;
    minLevel: number;
    setMinLevel: (v: number) => void;
    maxLevel: number;
    setMaxLevel: (v: number) => void;
    newMembersThisWeek: number;
    leftMembersThisWeek: number;
    invitesCount: number;
    applicationsOpen: boolean;
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
    levelRange,
    setLevelRange,
    setMinLevel,
    setMaxLevel,
   
    invitesCount,
    applicationsOpen,
}) => {
    const handleLevelRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLevelRange(value); // Guarda el formato visual "100-50"

        const match = value.match(/^(\d+)\s*-\s*(\d+)$/);
        if (match) {
            const [, firstStr, secondStr] = match;
            const num1 = parseInt(firstStr, 10);
            const num2 = parseInt(secondStr, 10);

            // Determina min y max sin importar el orden ingresado
            const realMin = Math.min(num1, num2);
            const realMax = Math.max(num1, num2);

            if (!isNaN(realMin)) setMinLevel(realMin);
            if (!isNaN(realMax)) setMaxLevel(realMax);
        } else {
            setMinLevel(0);
            setMaxLevel(1000);
        }
    };
    return (
        <div className="bg-[#2d1a0f] border-2 border-[#5d3b1e] rounded-lg p-4 mb-4">
            {/* Contador de miembros */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-[#e8d5b5]">
                <div className="flex items-center gap-2">
                    <span className="font-bold">Total:</span>
                    <span className="bg-[#1a1008] px-3 py-1 rounded">{totalMembers}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[#8bc34a]">Online:</span>
                    <span className="bg-[#1a1008] px-3 py-1 rounded">{onlineCount}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[#aaaaaa]">Offline:</span>
                    <span className="bg-[#1a1008] px-3 py-1 rounded">{offlineCount}</span>
               
                </div>
              
                <div className="flex items-center gap-2">
                    <span className="font-bold">Aplicaciones:</span>
                    <span className={`px-3 py-1 rounded ${applicationsOpen ? 'bg-[#4caf50]' : 'bg-[#f44336]'}`}>
                        {applicationsOpen ? 'Abiertas' : 'Cerradas'} 
                    </span>
                </div>
            </div>

            {/* Segunda fila con información de invitaciones */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-[#e8d5b5]">
            </div>
            {/* Controles de filtrado */}
            <div className="flex flex-wrap justify-center gap-4">
                {/* Checkbox Mostrar solo online */}
                <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={showOnlyOnline}
                                onChange={(e) => setShowOnlyOnline(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`block w-10 h-6 rounded-full ${showOnlyOnline ? 'bg-[#5d3b1e]' : 'bg-[#1a1008]'}`}></div>
                            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition ${showOnlyOnline ? 'transform translate-x-4 bg-[#e8d5b5]' : 'bg-[#aaaaaa]'}`}></div>
                        </div>
                        <div className="ml-3 text-[#e8d5b5] font-medium">
                            Mostrar solo online
                        </div>
                    </label>
                </div>

                {/* Selector de orden */}
                <div className="flex items-center">
                    <label className="flex items-center text-[#e8d5b5]">
                        <span className="mr-2 font-medium">Ordenar por:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[#1a1008] border border-[#5d3b1e] text-[#e8d5b5] rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#c4a97a]"
                        >
                            <option value="name">Nombre (A-Z)</option>
                            <option value="vocation">Vocación (A-Z)</option>
                            <option value="level">Nivel</option>
                            <option value="status">Estado</option>
                            <option value="Druid">Druid</option>
                            <option value="Paladin">Paladin</option>
                            <option value="Sorcerer">Sorcerer</option>
                            <option value="Knight">Knight</option>
                            <option value="Monk">Monk</option>
                        </select>
                    </label>
                </div>

                {/* Filtro de quest */}
                <div className="flex items-center">
                    <label className="flex items-center text-[#e8d5b5]">
                        <span className="mr-2 font-medium">Filtrar:</span>
                        <input
                            type="text"
                            value={questFilter}
                            onChange={(e) => setQuestFilter(e.target.value)}
                            placeholder="Nombre de quest"
                            className="bg-[#1a1008] border border-[#5d3b1e] text-[#e8d5b5] rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#c4a97a]"
                        />
                    </label>
                </div>

                {/* Filtro de rango de niveles */}
                <div className="flex items-center">
                    <label className="flex items-center text-[#e8d5b5]">
                        <span className="mr-2 font-medium">Rango:</span>
                        <input
                            type="text"
                            value={levelRange}
                            onChange={handleLevelRangeChange}
                            placeholder="Ej: 100-50"
                            className="bg-[#1a1008] border border-[#5d3b1e] text-[#e8d5b5] rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#c4a97a] w-24"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default GuildTableHeader;