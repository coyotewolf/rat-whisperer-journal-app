
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Pencil, Activity, Scale, Thermometer, Pill, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getRecentActivityCardColorClasses, getActivityStatusClasses } from "@/utils/cardStyleUtils";
import { getCategoryHierarchy, getPriorityClasses } from "@/utils/categoryHierarchy";

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

  const renderActivityContent = (activity: any) => {
    const hierarchy = getCategoryHierarchy(activity.type);
    
    switch (activity.type) {
      case 'health':
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-center gap-2 mb-2">
              {getLogIcon(activity.type)}
              <p className={hierarchy.visualWeight.titleSize}>{t(activity.type)}</p>
            </div>
            {activity.status && (
              <div className="mb-2">
                <Badge className={`${getActivityStatusClasses(activity.status)} ${hierarchy.visualWeight.statusSize}`}>
                  {t(activity.status)}
                </Badge>
              </div>
            )}
            <div className="space-y-1">
              <p className={`${hierarchy.visualWeight.timeSize} opacity-80`}>
                {activity.rat} • {activity.time}
              </p>
              {activity.notes && (
                <p className={`${hierarchy.visualWeight.timeSize} opacity-70 line-clamp-2`}>
                  {activity.notes}
                </p>
              )}
            </div>
          </div>
        );

      case 'weight':
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-center gap-2 mb-2">
              {getLogIcon(activity.type)}
              <p className={hierarchy.visualWeight.titleSize}>{t(activity.type)}</p>
            </div>
            {activity.weight && (
              <div className="mb-2">
                <span className={`${hierarchy.visualWeight.valueSize} text-primary`}>
                  {activity.weight}g
                </span>
              </div>
            )}
            <p className={`${hierarchy.visualWeight.timeSize} opacity-80`}>
              {activity.rat} • {activity.time}
            </p>
          </div>
        );

      case 'behavior':
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-center gap-2 mb-2">
              {getLogIcon(activity.type)}
              <p className={hierarchy.visualWeight.titleSize}>{t(activity.type)}</p>
            </div>
            {activity.behaviorTags && activity.behaviorTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {activity.behaviorTags.map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    className={`bg-primary text-primary-foreground border-0 ${hierarchy.visualWeight.statusSize}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <p className={`${hierarchy.visualWeight.timeSize} opacity-80`}>
              {activity.rat} • {activity.time}
            </p>
          </div>
        );

      case 'medication':
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-center gap-2 mb-2">
              {getLogIcon(activity.type)}
              <p className={hierarchy.visualWeight.titleSize}>{t(activity.type)}</p>
            </div>
            {activity.status && (
              <div className="mb-2">
                <Badge className={`${getActivityStatusClasses(activity.status)} ${hierarchy.visualWeight.statusSize}`}>
                  {t(activity.status)}
                </Badge>
              </div>
            )}
            <p className={`${hierarchy.visualWeight.timeSize} opacity-80`}>
              {activity.rat} • {activity.time}
            </p>
          </div>
        );

      case 'feeding':
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-center gap-2 mb-2">
              {getLogIcon(activity.type)}
              <p className={hierarchy.visualWeight.titleSize}>{t(activity.type)}</p>
            </div>
            {activity.status && (
              <div className="mb-2">
                <Badge className={`${getActivityStatusClasses(activity.status)} ${hierarchy.visualWeight.statusSize}`}>
                  {t(activity.status)}
                </Badge>
              </div>
            )}
            <p className={`${hierarchy.visualWeight.timeSize} opacity-80`}>
              {activity.rat} • {activity.time}
            </p>
          </div>
        );

      default:
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-center gap-2 mb-1">
              {getLogIcon(activity.type)}
              <p className={hierarchy.visualWeight.titleSize}>{t(activity.type)}</p>
              {activity.status && (
                <Badge className={`${getActivityStatusClasses(activity.status)} ${hierarchy.visualWeight.statusSize}`}>
                  {t(activity.status)}
                </Badge>
              )}
            </div>
            <p className={`${hierarchy.visualWeight.timeSize} opacity-80`}>
              {activity.rat} • {activity.time}
            </p>
          </div>
        );
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
            {recentActivities.map((activity) => {
              const hierarchy = getCategoryHierarchy(activity.type);
              const priorityClasses = getPriorityClasses(hierarchy.priority);
              
              return (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between p-4 rounded-lg group cursor-pointer hover:brightness-95 transition-all ${getRecentActivityCardColorClasses(activity.type)} ${priorityClasses} ${hierarchy.spacing.external}`}
                  onClick={() => onLogCardClick(activity)}
                >
                  <div className="flex-1">
                    {renderActivityContent(activity)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-70 hover:opacity-100 hover:text-primary h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditActivity(activity);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
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
