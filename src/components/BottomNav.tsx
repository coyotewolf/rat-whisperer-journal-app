
import { useLocation, Link } from "react-router-dom";
import { Home, Users, Activity, BookOpen, MessageSquare } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/rats", icon: Users, label: "Rats" },
    { path: "/logs", icon: Activity, label: "Logs" },
    { path: "/library", icon: BookOpen, label: "Library" },
    { path: "/community", icon: MessageSquare, label: "Community" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive 
                  ? "text-orange-600 bg-orange-50" 
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
