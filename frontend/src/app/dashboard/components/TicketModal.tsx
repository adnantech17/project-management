import React, { FC, FormEvent, useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import Select from "@/components/Select";
import { CreateTicketForm } from "@/types/forms";
import { Category } from "@/types/models";

const TicketModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: CreateTicketForm) => void;
}> = ({ isOpen, onClose, categories, onSubmit }) => {

  const [formData, setFormData] = useState<CreateTicketForm>({
    title: "",
    description: "",
    expiry_date: "",
    category_id: categories[0]?.id || "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmit(formData);    
    setFormData({
      title: "",
      description: "",
      expiry_date: "",
      category_id: categories[0]?.id || "",
    });
    
    onClose();
  };

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title..."
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          placeholder="Enter task description..."
        />

        <Select
          label="Category"
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          options={categoryOptions}
          placeholder="Select a category..."
        />

        <Input
          label="Expiry Date"
          type="date"
          value={formData.expiry_date}
          onChange={(e) =>
            setFormData({ ...formData, expiry_date: e.target.value })
          }
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TicketModal;
