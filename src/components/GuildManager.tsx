import React from "react";
import { GuildMember, MemberChange, CheckedItems } from "../types";
import GuildTableHeader from "./GuildTableHeader";
import GuildMembersTable from "./GuildMembersTable";
import PlayerModal from "./PlayerModal/PlayerModal";
import MemberChangesSection from "./MemberChangesSection";


type Props = {
    allMembers: GuildMember[];
    setAllMembers: React.Dispatch<React.SetStateAction<GuildMember[]>>;
    loading: boolean;
    error: string;
    showOnlyOnline: boolean;
    setShowOnlyOnline: React.Dispatch<React.SetStateAction<boolean>>;
    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    questFilter: string;
    setQuestFilter: React.Dispatch<React.SetStateAction<string>>;
    filteredMembers: GuildMember[];
    selectedPlayer: GuildMember | null;
    setSelectedPlayer: React.Dispatch<React.SetStateAction<GuildMember | null>>;
    checkedItems: CheckedItems;  // Usa el tipo definido globalmente
    setCheckedItems: React.Dispatch<React.SetStateAction<CheckedItems>>;

    levelRange: string;
    setLevelRange: React.Dispatch<React.SetStateAction<string>>;
    minLevel: number;
    setMinLevel: React.Dispatch<React.SetStateAction<number>>;
    maxLevel: number;
    setMaxLevel: React.Dispatch<React.SetStateAction<number>>;
    newMembersThisWeek: number;       // ✅ Añadir esta línea
    leftMembersThisWeek: number;      // ✅ Añadir esta línea
    invitesCount: number;             // ✅ Añadir esta línea
    applicationsOpen: boolean;        // ✅ Añadir esta línea (¡Esta es la clave!)
    memberChanges: MemberChange[];
};

const GuildManager: React.FC<Props> = ({
    allMembers,
    setAllMembers,
    loading,
    error,
    showOnlyOnline,
    setShowOnlyOnline,
    sortBy,
    setSortBy,
    questFilter,
    setQuestFilter,
    filteredMembers,
    selectedPlayer,
    setSelectedPlayer,
    checkedItems,
    setCheckedItems,
    levelRange,
    setLevelRange,
    minLevel,
    setMinLevel,
    maxLevel,
    setMaxLevel,
    newMembersThisWeek,    // ✅ Añade esta línea
    leftMembersThisWeek,   // ✅ Añade esta línea
    invitesCount,         // ✅ Añade esta línea
    applicationsOpen,
    memberChanges,
}) => {
    return (
        <div className="bg-[#1a1008]   md:p-6">
            <div className="max-w-7xl mx-auto">

                <div className="bg-[#2d1a0f]   border-[#5d3b1e] ">
                    <GuildTableHeader
                        totalMembers={allMembers.length}
                        onlineCount={allMembers.filter(m => m.status.toLowerCase() === "online").length}
                        offlineCount={allMembers.filter(m => m.status.toLowerCase() !== "online").length}
                        showOnlyOnline={showOnlyOnline}
                        setShowOnlyOnline={setShowOnlyOnline}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        questFilter={questFilter}
                        setQuestFilter={setQuestFilter}
                        levelRange={levelRange}
                        setLevelRange={setLevelRange}
                        minLevel={minLevel}
                        setMinLevel={setMinLevel}
                        maxLevel={maxLevel}
                        setMaxLevel={setMaxLevel}
                        newMembersThisWeek={newMembersThisWeek}
                        leftMembersThisWeek={leftMembersThisWeek}
                        invitesCount={invitesCount}
                        applicationsOpen={applicationsOpen}
                    />

                </div>
                <MemberChangesSection changes={memberChanges} />
                <div className="bg-[#2d1a0f] border-2 border-[#5d3b1e] shadow-lg ">
                    {loading && (
                        <p className="text-center text-[#e8d5b5] py-8">Cargando miembros...</p>
                    )}

                    {error && (
                        <p className="text-center text-[#ff6b6b] py-8">{error}</p>
                    )}

                    {!loading && filteredMembers.length > 0 && (
                        <GuildMembersTable
                            members={filteredMembers}
                            onPlayerSelect={setSelectedPlayer}
                            checkedItems={checkedItems}
                            setCheckedItems={setCheckedItems}
                        />
                    )}

                    {!loading && filteredMembers.length === 0 && !error && (
                        <p className="text-center text-[#e8d5b5] py-8">No hay jugadores para mostrar.</p>
                    )}
                </div>

                {selectedPlayer && (
                    <PlayerModal
                        selectedPlayer={selectedPlayer}
                        setSelectedPlayer={setSelectedPlayer}
                        allMembers={allMembers}
                        setAllMembers={setAllMembers}
                        checkedItems={checkedItems}
                        setCheckedItems={setCheckedItems}
                    />
                )}
            </div>
        </div>
    );
};

export default GuildManager;