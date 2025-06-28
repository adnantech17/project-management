"use client";

import { FC, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";
import Button from "./Button";
import { useDraft } from "@/context/DraftContext";

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar: FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { clearAllDrafts } = useDraft();

  const handleLogout = () => {
    clearAllDrafts();
    logout();
    router.push("/login");
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    router.push("/dashboard/settings");
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-50 h-[8vh]">
      <div className="flex items-center space-x-4">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          className="p-2 hover:bg-gray-100 rounded-md lg:hidden"
        >
          <Menu size={20} />
        </Button>
        
        <div className="items-center space-x-2 ml-4">
          <h1 className="text-2xl font-bold text-gray-900">ADPM</h1>
          <span className="text-sm text-gray-500 hidden sm:block">Task Management</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="ghost"
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
          >
            <ProfileAvatar 
              username={user?.username || "User"} 
              profile_picture={user?.profile_picture}
              size="sm"
            />
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.username}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
              <Button
                onClick={handleSettings}
                variant="ghost"
                className="w-full justify-start flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Settings size={16} />
                <span>Settings</span>
              </Button>
              
              <hr className="my-1 border-gray-200" />
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
