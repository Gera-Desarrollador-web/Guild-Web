import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BossEntry } from "../../types";


type SortableItemProps = {
  id: string;
  entry: BossEntry;
  activeTab: "bosses" | "quests";
  checked: boolean;
  onItemCheck: (itemName: string, checked: boolean) => void;
  onRemoveItem: (itemName: string) => void;
  onEditItem: (itemName: string) => void;
  isExpanded: boolean;
  toggleExpand: (itemName: string) => void;
  children?: React.ReactNode;
};

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  entry,
  activeTab,
  checked,
  onItemCheck,
  onRemoveItem,
  onEditItem,
  isExpanded,
  toggleExpand,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Cambiado a 0.5 para que sea semi-transparente
    zIndex: isDragging ? 1 : 'auto', // Asegura que el elemento arrastrado esté sobre los demás
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`mb-3 last:mb-0 border-b border-[#3a1800] pb-2 last:border-0 ${isDragging ? 'shadow-lg' : ''}`} 
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
        <div className="flex items-center space-x-2 mb-1 sm:mb-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-move focus:outline-none bg-transparent border-none"
          >
            <span className="text-[#c4a97a]">☰</span>
          </button>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onItemCheck(entry.name, e.target.checked)}
            className="w-4 h-4 text-[#c4a97a] bg-[#1a1008] border-[#5a2800] rounded focus:ring-[#c4a97a]"
          />
          <button
            onClick={() => toggleExpand(entry.name)}
            className="font-semibold text-[#e8d8b0] hover:underline"
          >
            {entry.name}
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditItem(entry.name)}
            className="text-[#c4a97a] hover:text-[#e8d5b5] text-sm bg-[#3a1800] hover:bg-[#5a2800] px-2 py-1 rounded transition"
            title={`Editar ${activeTab.slice(0, -1)}`}
          >
            Editar
          </button>
          <button
            onClick={() => onRemoveItem(entry.name)}
            className="text-[#ff6b6b] hover:text-[#ff8f8f] text-sm bg-[#3a1800] hover:bg-[#5a2800] px-2 py-1 rounded transition"
            title={`Eliminar ${activeTab.slice(0, -1)}`}
          >
            Eliminar
          </button>
        </div>
      </div>

      {isExpanded && children}
    </li>
  );
};