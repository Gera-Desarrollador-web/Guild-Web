import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableSubItemProps = {
  id: string;
  entryName: string;
  subItem: string;
  checked: boolean;
  onSubItemCheck: (entryName: string, subItem: string, checked: boolean) => void;
  onRemoveSubItem: (entryName: string, subItem: string) => void;
  onEditSubItem: (entryName: string, subItem: string) => void;
  editingSubItem: {
    parentItem: string;
    subItem: string;
    originalSubItem: string;
  } | null;
  onSubItemChange: (value: string) => void;
  onSaveSubItemEdit: () => void;
  onCancelSubItemEdit: () => void;
};

export const SortableSubItem: React.FC<SortableSubItemProps> = ({
  id,
  entryName,
  subItem,
  checked,
  onSubItemCheck,
  onRemoveSubItem,
  onEditSubItem,
  editingSubItem,
  onSubItemChange,
  onSaveSubItemEdit,
  onCancelSubItemEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li 
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center"
    >
      <div className="flex items-center space-x-2 mb-1 sm:mb-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move focus:outline-none"
        >
          <span className="text-[#c4a97a] text-xs">☰</span>
        </button>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onSubItemCheck(entryName, subItem, e.target.checked)}
          className="w-4 h-4 text-[#c4a97a] bg-[#1a1008] border-[#5a2800] rounded focus:ring-[#c4a97a]"
        />
        {editingSubItem?.parentItem === entryName && editingSubItem?.originalSubItem === subItem ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingSubItem.subItem}
              onChange={(e) => onSubItemChange(e.target.value)}
              className="bg-[#1a1008] border border-[#5a2800] text-[#e8d8b0] px-2 py-1 rounded"
            />
            <button
              onClick={onSaveSubItemEdit}
              className="text-green-400 hover:text-green-300 text-sm"
              title="Guardar"
            >
              ✓
            </button>
            <button
              onClick={onCancelSubItemEdit}
              className="text-red-400 hover:text-red-300 text-sm"
              title="Cancelar"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="text-[#c4a97a]">{subItem}</span>
            <button
              onClick={() => onEditSubItem(entryName, subItem)}
              className="text-[#c4a97a] hover:text-[#e8d5b5] text-sm ml-2"
              title="Editar subitem"
            >
              ✏️
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => onRemoveSubItem(entryName, subItem)}
        className="text-[#ff6b6b] hover:text-[#ff8f8f] text-sm bg-[#3a1800] hover:bg-[#5a2800] px-2 py-1 rounded transition"
        title="Eliminar subitem"
      >
        Eliminar
      </button>
    </li>
  );
};