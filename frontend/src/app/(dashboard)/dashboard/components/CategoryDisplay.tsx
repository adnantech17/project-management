import { FC } from "react";

interface CategoryDisplayProps {
  category?: { id: string; name: string; color: string };
  categories: { id: string; name: string; color?: string }[];
  selectedCategoryId: string;
  onCategoryChange?: (categoryId: string) => void;
  isEditMode: boolean;
}

const CategoryDisplay: FC<CategoryDisplayProps> = ({
  category,
  categories,
  selectedCategoryId,
  onCategoryChange,
  isEditMode,
}) => {
  const selectedCategory =
    category || categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Category
      </label>
      {isEditMode ? (
        <select
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex items-center space-x-2 px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedCategory?.color || "#3B82F6" }}
          />
          <span className="text-gray-700">{selectedCategory?.name}</span>
        </div>
      )}
    </div>
  );
};

export default CategoryDisplay;