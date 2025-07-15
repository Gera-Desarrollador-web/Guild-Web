import React, { useState } from "react";
import { BossEntry } from "../../types";
import { AddSubItemInput } from "./AddSubItemInput";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";


type BossQuestListProps = {
    items: BossEntry[];
    activeTab: "bosses" | "quests";
    checkedItems: { [key: string]: boolean };
    playerName: string;
    onItemCheck: (itemName: string, checked: boolean) => void;
    onSubItemCheck: (itemName: string, subItem: string, checked: boolean) => void;
    onRemoveItem: (itemName: string) => void;
    onRemoveSubItem: (itemName: string, subItem: string) => void;
    onAddSubItem: (entryName: string, subItem: string) => void;
    onEditItem: (itemName: string) => void;
    onEditSubItem: (parentItem: string, subItem: string) => void;
    editingSubItem: {
        parentItem: string;
        subItem: string;
        originalSubItem: string;
    } | null;
    onSubItemChange: (value: string) => void;
    onSaveSubItemEdit: () => void;
    onCancelSubItemEdit: () => void;
    onReorderItems: (newItems: BossEntry[]) => void;
    onReorderSubItems: (parentName: string, newSubItems: string[]) => void;
};

export const BossQuestList: React.FC<BossQuestListProps> = ({
    items,
    activeTab,
    checkedItems,
    onItemCheck,
    onSubItemCheck,
    onRemoveItem,
    onRemoveSubItem,
    onAddSubItem,
    onEditItem,
    onEditSubItem,
    editingSubItem,
    onSubItemChange,
    onSaveSubItemEdit,
    onCancelSubItemEdit,
    onReorderItems,
    onReorderSubItems,
}) => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const toggleExpand = (itemName: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        // Handle main items drag
        if (active.id.toString().startsWith("item-")) {
            const oldIndex = items.findIndex(item => `item-${item.name}` === active.id);
            const newIndex = items.findIndex(item => `item-${item.name}` === over.id);
            onReorderItems(arrayMove(items, oldIndex, newIndex));
        }
        // Handle sub-items drag
        else if (active.id.toString().includes("::")) {
            const [parentName] = active.id.toString().split("::");
            const parentItem = items.find(item => item.name === parentName);
            if (!parentItem) return;

            const oldIndex = parentItem.subItems.findIndex(sub => `${parentName}::${sub}` === active.id);
            const newIndex = parentItem.subItems.findIndex(sub => `${parentName}::${sub}` === over.id);

            onReorderSubItems(parentName, arrayMove(parentItem.subItems, oldIndex, newIndex));
        }
    };

    const getHeaderText = () => {
        return activeTab === "bosses" ? "Lista de Bosses" : "Lista de Quests";
    };

    return (
        <div className="bg-[#2d1a0f] border-2 border-[#5a2800] rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#5a2800] p-2 border-b border-[#3a1800]">
                <h3 className="text-[#e8d8b0] font-bold text-center">{getHeaderText()}</h3>
            </div>

            <div className="p-3">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(item => `item-${item.name}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul className="max-h-64 overflow-y-auto custom-scrollbar">
                            {items.map((entry) => (
                                <SortableItem
                                    key={`item-${entry.name}`}
                                    id={`item-${entry.name}`}
                                    entry={entry}
                                    activeTab={activeTab}
                                    checked={checkedItems[entry.name] || false}
                                    onItemCheck={onItemCheck}
                                    onRemoveItem={onRemoveItem}
                                    onEditItem={onEditItem}
                                    isExpanded={!!expandedItems[entry.name]}
                                    toggleExpand={toggleExpand}
                                >
                                    {expandedItems[entry.name] && entry.subItems.length > 0 && (
                                        <SortableContext
                                            items={entry.subItems.map(sub => `${entry.name}::${sub}`)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <ul className="ml-4 sm:ml-6 mb-2 mt-1 space-y-1">
                                                {entry.subItems.map((sub) => (
                                                    <SortableSubItem
                                                        key={`${entry.name}::${sub}`}
                                                        id={`${entry.name}::${sub}`}
                                                        entryName={entry.name}
                                                        subItem={sub}
                                                        checked={checkedItems[`${entry.name}::${sub}`] || false}
                                                        onSubItemCheck={onSubItemCheck}
                                                        onRemoveSubItem={onRemoveSubItem}
                                                        onEditSubItem={onEditSubItem}
                                                        editingSubItem={editingSubItem}
                                                        onSubItemChange={onSubItemChange}
                                                        onSaveSubItemEdit={onSaveSubItemEdit}
                                                        onCancelSubItemEdit={onCancelSubItemEdit}
                                                    />
                                                ))}
                                            </ul>
                                        </SortableContext>
                                    )}

                                    <AddSubItemInput
                                        entryName={entry.name}
                                        onAddSubItem={onAddSubItem}
                                        className="mt-2"
                                    />
                                </SortableItem>
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};