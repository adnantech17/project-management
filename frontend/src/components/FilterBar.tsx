"use client";

import React, { FC, useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import { User } from "@/types/models";
import { getInitials, getProfileColor } from "@/utils/profile";

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedUserIds: string[];
  onUserIdsChange: (userIds: string[]) => void;
  onlyMyIssues: boolean;
  onOnlyMyIssuesChange: (value: boolean) => void;
  users: User[];
  className?: string;
}

const FilterBar: FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedUserIds,
  onUserIdsChange,
  onlyMyIssues,
  onOnlyMyIssuesChange,
  users,
  className = "",
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userSearchInputRef = useRef<HTMLInputElement>(null);

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
  const availableUsers = users.filter(user => !selectedUserIds.includes(user.id));
  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
        setUserSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isUserDropdownOpen && userSearchInputRef.current) {
      userSearchInputRef.current.focus();
    }
  }, [isUserDropdownOpen]);

  const handleUserSelect = (userId: string) => {
    onUserIdsChange([...selectedUserIds, userId]);
    setUserSearchTerm("");
  };

  const handleUserRemove = (userId: string) => {
    onUserIdsChange(selectedUserIds.filter(id => id !== userId));
  };

  const handleClearAll = () => {
    onUserIdsChange([]);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
        />
      </div>

      <div className="relative" ref={userDropdownRef}>
        <div 
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors min-w-[200px]"
        >
          <div className="flex items-center -space-x-1">
            {selectedUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white ${getProfileColor(user.username)}`}
                title={user.username}
              >
                {getInitials(user.username)}
              </div>
            ))}
            
            {/* Add More Button */}
            <button
              type="button"
              className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center hover:bg-gray-400 transition-colors"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>

          {/* Text and Arrow */}
          <div className="flex items-center gap-2 ml-2">
            {selectedUsers.length > 0 ? (
              <>
                <span className="text-sm text-gray-700">
                  {selectedUsers.length > 3 ? (
                    <>
                      {selectedUsers.slice(0, 2).map(u => u.username).join(', ')}
                      {selectedUsers.length > 2 && ` +${selectedUsers.length - 2} more`}
                    </>
                  ) : (
                    selectedUsers.map(u => u.username).join(', ')
                  )}
                </span>
                {selectedUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500">Assignees</span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {isUserDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={userSearchInputRef}
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Selected:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${getProfileColor(user.username)}`}
                      >
                        {getInitials(user.username)}
                      </div>
                      <span>{user.username}</span>
                      <button
                        type="button"
                        onClick={() => handleUserRemove(user.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  {userSearchTerm ? "No users found" : "All users are selected"}
                </div>
              ) : (
                filteredUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getProfileColor(user.username)}`}
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

      <button
        type="button"
        onClick={() => onOnlyMyIssuesChange(!onlyMyIssues)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
          onlyMyIssues
            ? 'bg-blue-100 text-blue-700 border border-blue-300'
            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
        }`}
      >
        Only My Issues
      </button>
    </div>
  );
};

export default FilterBar;
