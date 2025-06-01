
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
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/10 border-t border-white/20 px-4 py-2 shadow-2xl">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 transform ${
                isActive 
                  ? "text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg scale-105" 
                  : "text-white/70 hover:text-white hover:bg-white/10 hover:scale-105"
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
