import { FC } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "./Button";
import { Home, FileText, Settings, LogOut, History } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Sidebar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ADPM</h1>
        <p className="text-sm text-gray-500">Task Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Button
              key={item.path}
              onClick={() => router.push(item.path)}
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

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
