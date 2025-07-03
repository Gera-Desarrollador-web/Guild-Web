import React from "react";

type Props = {
  newCategoryName: string;
  setNewCategoryName: (val: string) => void;
  onAddCategory: () => void;
};

const AddCategoryForm: React.FC<Props> = ({
  newCategoryName,
  setNewCategoryName,
  onAddCategory,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        className="border rounded px-2 py-1 text-sm w-full"
        placeholder="Nueva categoría"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
        onClick={onAddCategory}
      >
        Agregar
      </button>
    </div>
  );
};

export default AddCategoryForm;
