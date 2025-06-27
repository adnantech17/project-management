import { FC } from "react";

interface CategoryDisplayProps {
  category?: { id: string; name: string; color: string };
  categories: { id: string; name: string; color?: string }[];
  selectedCategoryId: string;
  onCategoryChange?: (categoryId: string) => void;
  isEditMode: boolean;
  required?: boolean;
}

const CategoryDisplay: FC<CategoryDisplayProps> = ({
  category,
  categories,
  selectedCategoryId,
  onCategoryChange,
  isEditMode,
  required = false,
}) => {
  const selectedCategory =
    category || categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Category
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isEditMode ? (
        <select
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          required={required}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-gray-900">
          {selectedCategory?.name || "—"}
        </div>
      )}
    </div>
  );
};

export default CategoryDisplay;