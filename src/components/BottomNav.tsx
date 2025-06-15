
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Home, Users, Activity, BookOpen, MessageSquare } from "lucide-react";

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/", icon: Home, label: t("Home") },
    { path: "/rats", icon: Users, label: t("Rats") },
    { path: "/logs", icon: Activity, label: t("Logs") },
    { path: "/library", icon: BookOpen, label: t("Library") },
    { path: "/community", icon: MessageSquare, label: t("Community") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 shadow-2xl"> {/* Themed background and border */}
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
                  ? "text-primary-foreground bg-primary shadow-lg scale-105" // Themed active state
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105" // Themed inactive and hover states
              }`}
            >
              <Icon className="h-5 w-5 mb-1" /> {/* Icon color will inherit */}
              <span className="text-xs font-medium">{item.label}</span> {/* Text color will inherit */}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
