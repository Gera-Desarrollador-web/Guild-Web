import React, { useState, useEffect } from 'react';
import { MemberChange } from '../types';

const MemberChangesSection: React.FC<{ changes: MemberChange[] }> = ({ changes }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [invitedWithDetails, setInvitedWithDetails] = useState<MemberChange[]>([]);

    useEffect(() => {
        const fetchInviteDetails = async () => {
            // 1. Obtener invitaciones actuales/pendientes (sin filtrar por fecha)
            const currentInvites = changes.filter(c => c.type === 'invited');

            // 2. Obtener miembros que se unieron/salieron en los últimos 7 días
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentJoined = changes.filter(c =>
                c.type === 'joined' &&
                new Date(c.date) > sevenDaysAgo
            );

            const recentLeft = changes.filter(c =>
                c.type === 'left' &&
                new Date(c.date) > sevenDaysAgo
            );

            // Procesar detalles de invitados
            const details = await Promise.all(
                currentInvites.map(async (invite) => {
                    try {
                        const charUrl = `https://api.tibiadata.com/v4/character/${encodeURIComponent(invite.name)}`;
                        const charRes = await fetch(charUrl);
                        const charData = await charRes.json();
                        return {
                            ...invite,
                            level: charData.character?.character?.level || invite.level,
                            vocation: charData.character?.character?.vocation || invite.vocation
                        };
                    } catch (e) {
                        return invite;
                    }
                })
            );

            setInvitedWithDetails(details);

            // Actualizar estados para mostrar
            setJoinedMembers(recentJoined);
            setLeftMembers(recentLeft);
        };

        fetchInviteDetails();
    }, [changes]);

    // Estados para miembros recientes
    const [joinedMembers, setJoinedMembers] = useState<MemberChange[]>([]);
    const [leftMembers, setLeftMembers] = useState<MemberChange[]>([]);
    const invitedMembers = invitedWithDetails;

    return (
        <div className="bg-[#2d1a0f] border-2 border-[#5d3b1e] rounded-lg mb-4 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-[#5a2800] hover:bg-[#7a3a00] transition"
            >
                <h3 className="text-[#e8d5b5] font-bold">Movimientos Recientes</h3>
                <span className="text-[#e8d5b5]">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>

            {isOpen && (
                <div className="p-4 space-y-4">
                    {/* Sección de nuevos miembros (últimos 7 días) */}
                    <div className="bg-[#1a1008] p-3 rounded-lg">
                        <h4 className="text-[#4caf50] font-bold mb-2 border-b border-[#5d3b1e] pb-1">
                            Nuevos Miembros (7 días) ({joinedMembers.length})
                        </h4>
                        {joinedMembers.length > 0 ? (
                            <ul className="space-y-1">
                                {joinedMembers.map((member, i) => (
                                    <li key={i} className="flex justify-between text-[#e8d5b5]">
                                        <span>{member.name}</span>
                                        <span className="text-[#c4a97a]">
                                            {new Date(member.date).toLocaleDateString()} - {member.vocation} (Lvl {member.level})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[#c4a97a] italic">No hay nuevos miembros</p>
                        )}
                    </div>

                    {/* Sección de miembros que salieron (últimos 7 días) */}
                    <div className="bg-[#1a1008] p-3 rounded-lg">
                        <h4 className="text-[#f44336] font-bold mb-2 border-b border-[#5d3b1e] pb-1">
                            Miembros Salidos (7 días) ({leftMembers.length})
                        </h4>
                        {leftMembers.length > 0 ? (
                            <ul className="space-y-1">
                                {leftMembers.map((member, i) => (
                                    <li key={i} className="flex justify-between text-[#e8d5b5]">
                                        <span>{member.name}</span>
                                        <span className="text-[#c4a97a]">
                                            {new Date(member.date).toLocaleDateString()} - {member.vocation} (Lvl {member.level})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[#c4a97a] italic">Ningún miembro ha salido</p>
                        )}
                    </div>

                    {/* Sección de miembros invitados (actuales) */}
                    <div className="bg-[#1a1008] p-3 rounded-lg">
                        <h4 className="text-[#ff9800] font-bold mb-2 border-b border-[#5d3b1e] pb-1">
                            Invitaciones Pendientes ({invitedMembers.length})
                        </h4>
                        {invitedMembers.length > 0 ? (
                            <ul className="space-y-1">
                                {invitedMembers.map((member, i) => (
                                    <li key={i} className="flex justify-between text-[#e8d5b5]">
                                        <span>{member.name}</span>
                                        <span className="text-[#c4a97a]">
                                            {member.vocation} (Lvl {member.level}) -
                                            Invitado el: {new Date(member.date).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[#c4a97a] italic">No hay invitaciones pendientes</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberChangesSection;