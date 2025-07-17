import React from "react";
import { GuildMember } from "../../types";

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

type PlayerInfoProps = {
    selectedPlayer: GuildMember;
    selectedTimeZone: { code: string; label: string; timeZone: string };
    timeZones: { code: string; label: string; timeZone: string }[];
    onTimeZoneChange: (code: string) => void;
    levelDiff: number | null;
};

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
    selectedPlayer,
    selectedTimeZone,
    timeZones,
    onTimeZoneChange,
    levelDiff,
}) => {
    const vocationGifUrl =
        vocationGifs[selectedPlayer.vocation]?.[selectedPlayer.sex.toLowerCase()] ||
        "https://media.giphy.com/media/ya4eevXU490Iw/giphy.gif";

    const getLevelProgressText = () => {
        if (levelDiff === null) return null;

        let text = "";
        let colorClass = "";

        if (levelDiff > 0) {
            text = `+${levelDiff} en 7 días`;
            colorClass = "text-[#8bc34a]"; // Verde
        } else if (levelDiff < 0) {
            text = `${levelDiff} en 7 días`;
            colorClass = "text-[#ff6b6b]"; // Rojo
        } else {
            text = `0 en 7 días`;
            colorClass = "text-[#aaaaaa]"; // Gris
        }

        return (
            <span className={`ml-2 ${colorClass} font-semibold`}>
                {text}
            </span>
        );
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 p-3 bg-[#2d1a0f] rounded-lg border-2 border-[#5d3b1e]">
            <div className="flex flex-col sm:flex-row w-full gap-3">
                <div className="flex justify-center sm:justify-end sm:ml-2">
                    <img
                        src={vocationGifUrl}
                        alt={`${selectedPlayer.vocation} ${selectedPlayer.sex}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                </div>
                <div className="flex-1">
                    <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-1 text-[#e8d5b5]">
                        <p>
                            <span className="font-bold">Nombre: </span>
                            {selectedPlayer.name}
                        </p>
                        <p>
                            <span className="font-bold">Lvl: </span>
                            {selectedPlayer.level}
                            {getLevelProgressText()}
                        </p>

                        <p>
                            <span className="font-bold">Vocación: </span>
                            {selectedPlayer.vocation}
                        </p>
                        <p>
                            <span className="font-bold">Estado: </span>
                            <span
                                className={
                                    selectedPlayer.status.toLowerCase() === "online"
                                        ? "text-[#8bc34a]"
                                        : "text-[#aaaaaa]"
                                }
                            >
                                {selectedPlayer.status}
                            </span>
                        </p>

                        <p>
                            <span className="font-bold">Hora local: </span>
                            {new Date().toLocaleTimeString("en-US", {
                                timeZone: selectedTimeZone.timeZone,
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            })}
                        </p>
                    </div>

                    <select
                        className="mt-2 ml-8 bg-[#1a1008] border border-[#5d3b1e] text-[#e8d5b5] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#c4a97a]"
                        value={selectedTimeZone.code}
                        onChange={(e) => onTimeZoneChange(e.target.value)}
                    >
                        {timeZones.map((zone) => (
                            <option
                                key={zone.code}
                                value={zone.code}
                                className="bg-[#2d1a0f]"
                            >
                                {zone.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};