
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Pencil, Activity, Scale, Thermometer, Pill, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getRecentActivityCardColorClasses, getActivityStatusClasses, getHealthStatusEmoji } from "@/utils/cardStyleUtils";

interface RecentActivitiesProps {
  recentActivities: any[];
  loading?: boolean;
  onLogCardClick: (activity: any) => void;
  onEditActivity: (activity: any) => void;
  onQuickLogClick: () => void;
}

const ActivitySkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-7 w-7 rounded" />
  </div>
);

const RecentActivities = ({ 
  recentActivities, 
  loading = false,
  onLogCardClick, 
  onEditActivity, 
  onQuickLogClick 
}: RecentActivitiesProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const capitalize = (s: string) => {
    if (typeof s !== 'string' || !s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "behavior":
        return <Activity className="h-4 w-4" />;
      case "health":
        return <Heart className="h-4 w-4" />;
      case "weight":
        return <Scale className="h-4 w-4" />;
      case "environment":
        return <Thermometer className="h-4 w-4" />;
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "feeding":
        return <Utensils className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-xl">
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => navigate('/logs')}
      >
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-destructive" />
          {t("Recent Activities")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="relative flex items-center justify-between p-3 rounded-lg group cursor-pointer transition-colors border bg-card hover:bg-accent/50 overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/40"
                onClick={() => onLogCardClick(activity)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 min-w-0">
                    {getLogIcon(activity.type)}
                    <p className="font-medium truncate">{t(capitalize(activity.type))}</p>
                    {activity.status ? (
                      <Badge
                        className={`${getActivityStatusClasses(activity.status)} border-0 text-xs`}
                      >
                        {t(activity.status)}
                        {getHealthStatusEmoji(activity.status) && (
                          <span className="ml-1">{getHealthStatusEmoji(activity.status)}</span>
                        )}
                      </Badge>
                    ) : null}
                  </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activity.behaviorTags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-primary text-primary-foreground border-0 text-xs"
                        >
                          {t(tag)}
                        </Badge>
                      ))}
                    </div>
                  <p className="text-sm opacity-80 truncate">{activity.rat} • {activity.time}</p>
                  {activity.weight && (
                    <p className="text-xs opacity-70 truncate">{t("Weight")}: {activity.weight}g</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-70 hover:opacity-100 hover:text-primary h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditActivity(activity);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 animate-fade-in">
            <p className="text-muted-foreground">{t("No recent activities")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onQuickLogClick}
              className="mt-2"
            >
              {t("Add Activity")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
