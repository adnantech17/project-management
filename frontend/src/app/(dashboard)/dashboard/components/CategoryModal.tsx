import React, { FC, FormEvent, useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/form/Input";
import { CreateCategoryForm } from "@/types/forms";
import { Category } from "@/types/models";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryForm) => void;
  onUpdate?: (categoryId: string, data: CreateCategoryForm) => void;
  category?: Category | null;
  mode?: "create" | "edit";
}

const CategoryModal: FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onUpdate,
  category = null,
  mode = "create"
}) => {
  const [formData, setFormData] = useState<CreateCategoryForm>({
    name: "",
    color: "#3B82F6",
  });

  const predefinedColors = [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#6B7280",
  ];

  useEffect(() => {
    if (category && mode === "edit") {
      setFormData({
        name: category.name,
        color: category.color,
      });
    } else {
      setFormData({ name: "", color: "#3B82F6" });
    }
  }, [category, mode, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "edit" && category && onUpdate) {
      onUpdate(category.id, formData);
    } else {
      onSubmit(formData);
    }
    setFormData({ name: "", color: "#3B82F6" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        {mode === "edit" ? "Edit Category" : "Add New Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter category name..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex space-x-2 mb-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full border-2 ${
                  formData.color === color
                    ? "border-gray-800"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {mode === "edit" ? "Update Category" : "Add Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
