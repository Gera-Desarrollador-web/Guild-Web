import React from "react";
import { GuildMember, CheckedItems } from "../types";

type Props = {
  members: GuildMember[];
  onPlayerSelect: (player: GuildMember) => void;
  checkedItems: CheckedItems;
  setCheckedItems: React.Dispatch<React.SetStateAction<CheckedItems>>;
};

const GuildMembersTable: React.FC<Props> = ({
  members,
  onPlayerSelect,
  
}) => (

  <div className="overflow-x-auto max-h-[600px]  border-2 border-[#5d3b1e] bg-[#2d1a0f] shadow-lg">
    <table className="w-full min-w-[600px] md:w-full border-collapse">
      <thead className="bg-[#1a1008] sticky top-0 z-20">
        <tr>
          <th className="w-1/4 border-b-2 border-[#5d3b1e] px-4 py-3 text-left text-[#e8d5b5] font-bold">
            Nombre
          </th>
          <th className="w-1/6 border-b-2 border-[#5d3b1e] px-4 py-3 text-left text-[#e8d5b5] font-bold">
            Nivel
          </th>
          <th className="w-1/4 border-b-2 border-[#5d3b1e] px-4 py-3 text-left text-[#e8d5b5] font-bold">
            Vocación
          </th>
          <th className="w-1/6 border-b-2 border-[#5d3b1e] px-4 py-3 text-left text-[#e8d5b5] font-bold">
            Estado
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#5d3b1e] overflow-y-auto">
        {members.map((player) => (
          <tr
            key={player.name}
            className="hover:bg-[#1a1008] transition-colors duration-150"
          >
            <td
              className="border-b border-[#5d3b1e] px-4 py-3 text-[#c4a97a] hover:text-[#e8d5b5] cursor-pointer"
              onClick={() => onPlayerSelect(player)}
            >
              <span className="hover:underline">{player.name}</span>
            </td>
            <td className="border-b border-[#5d3b1e] px-4 py-3 text-[#e8d5b5]">
              {player.level}
            </td>
            <td className="border-b border-[#5d3b1e] px-4 py-3 text-[#e8d5b5]">
              {player.vocation}
            </td>
            <td className="border-b border-[#5d3b1e] px-4 py-3">
              {player.status.toLowerCase() === "online" ? (
                <span className="text-[#8bc34a] font-semibold">Online</span>
              ) : (
                <span className="text-[#aaaaaa]">Offline</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {members.length === 0 && (
      <div className="p-4 text-center text-[#e8d5b5]">
        No hay miembros para mostrar
      </div>
    )}
  </div>
);

export default GuildMembersTable;