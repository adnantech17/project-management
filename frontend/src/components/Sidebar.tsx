import { FC } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "./Button";
import { Home, FileText, Settings, History } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      name: "All Tickets",
      path: "/dashboard/tickets",
      icon: FileText,
    },
    {
      name: "Activity Log",
      path: "/dashboard/activity",
      icon: History,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          fixed top-[60px] left-0 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out z-50
          lg:relative lg:top-0 lg:h-full lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[92vh]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                variant={active ? "primary" : "ghost"}
                className={`w-full justify-start flex items-center space-x-3 px-4 py-3 ${
                  active ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
