import React from "react";
import { GuildMember } from "../types";

type Props = {
  members: GuildMember[];
  onPlayerSelect: (player: GuildMember) => void;
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

const GuildMembersTable: React.FC<Props> = ({ members, onPlayerSelect }) => (
  <div className="overflow-x-auto max-w-full max-h-[600px]">
    <table className="w-full table-auto border-x border-b border-gray-300">
      <thead className="bg-gray-200 sticky top-0 z-20 border-t border-gray-300">
        <tr>
          <th className="border border-gray-300 bg-gray-200 px-4 py-2">Nombre</th>
          <th className="border border-gray-300 bg-gray-200 px-4 py-2">Nivel</th>
          <th className="border border-gray-300 bg-gray-200 px-4 py-2">Vocación</th>
          <th className="border border-gray-300 bg-gray-200 px-4 py-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {members.map((player) => (
          <tr key={player.name} className="hover:bg-gray-100">
            <td
              className="border border-gray-300 px-4 py-2 text-blue-600 hover:underline cursor-pointer"
              onClick={() => onPlayerSelect(player)}
            >
              {player.name}
            </td>
            <td className="border border-gray-300 px-4 py-2">{player.level}</td>
            <td className="border border-gray-300 px-4 py-2">{player.vocation}</td>
            <td className="border border-gray-300 px-4 py-2">
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

);

export default GuildMembersTable;
