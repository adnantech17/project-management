"use client";

import React, { useState, useRef, useEffect, FC } from "react";
import { Plus, X, Search } from "lucide-react";
import { User } from "@/types/models";
import { getInitials, getProfileColor } from "@/utils/profile";

interface UserAssignmentProps {
  users: User[];
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  label?: string;
  readonly?: boolean;
  className?: string;
}

const UserAssignment: FC<UserAssignmentProps> = ({
  users,
  selectedUserIds,
  onChange,
  label,
  readonly = false,
  className = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
  const availableUsers = users.filter(user => !selectedUserIds.includes(user.id));
  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleAddUser = (userId: string) => {
    onChange([...selectedUserIds, userId]);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    onChange(selectedUserIds.filter(id => id !== userId));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {selectedUsers.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 group hover:bg-gray-100 transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getProfileColor(user.username)}`}
            >
              {getInitials(user.username)}
            </div>
            <span className="text-sm text-gray-700">{user.username}</span>
            {!readonly && (
              <button
                type="button"
                onClick={() => handleRemoveUser(user.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 rounded-full p-1"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
        ))}

        {!readonly && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add more</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      {searchTerm ? "No users found" : "All users are already assigned"}
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleAddUser(user.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getProfileColor(user.username)}`}
                        >
                          {getInitials(user.username)}
                        </div>
                        <span className="text-sm text-gray-700">{user.username}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedUsers.length === 0 && readonly && (
          <span className="text-sm text-gray-500">No users assigned</span>
        )}
      </div>
    </div>
  );
};

export default UserAssignment;
