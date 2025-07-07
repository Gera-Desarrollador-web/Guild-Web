import React from "react";
import { GuildMember } from "../types";
import GuildTableHeader from "./GuildTableHeader";
import GuildMembersTable from "./GuildMembersTable";
import PlayerModal from "./PlayerModal";
import GuildTitle from "./GuildTitle";

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

}) => {
    return (
        <div >
            <GuildTitle />
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
            />

            {loading && <p className="text-center">Cargando...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && filteredMembers.length > 0 && (
                <GuildMembersTable
                    members={filteredMembers}
                    onPlayerSelect={setSelectedPlayer}
                    checkedItems={checkedItems}
                    setCheckedItems={setCheckedItems}
                />
            )}

            {!loading && filteredMembers.length === 0 && !error && (
                <p className="text-center">No hay jugadores para mostrar.</p>
            )}

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
    );
};

export default GuildManager;
