import React from "react";
import { GuildMember } from "../../types";

type DeathListProps = {
    deaths: GuildMember["deaths"];
};

export const DeathList: React.FC<DeathListProps> = ({ deaths }) => {
    if (!deaths || deaths.length === 0) return null;

    return (
        <div className="bg-[#2d1a0f] border-2 border-[#5d3b1e] rounded-lg p-4 mb-6">
            <h4 className="text-lg font-bold text-[#e8d5b5] mb-3">
                {deaths.length === 1 ? "Murió recientemente:" : "Muertes recientes:"}
            </h4>
            <ul className="space-y-3 max-h-48 overflow-y-auto">
                {deaths.map((death, idx) => (
                    <li key={idx} className="border-b border-[#5d3b1e] pb-3 last:border-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[#e8d5b5]">
                            <div>
                                <span className="font-bold text-[#c4a97a]">Nivel:</span> {death.level}
                            </div>
                            <div>
                                <span className="font-bold text-[#c4a97a]">Fecha:</span> {new Date(death.time).toLocaleString()}
                            </div>
                            <div className="sm:col-span-1">
                                <span className="font-bold text-[#c4a97a]">Razón:</span> 
                                <span className="ml-1">{death.reason}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};