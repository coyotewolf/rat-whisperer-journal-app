
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { getRecentActivityCardColorClasses, getActivityStatusClasses } from "@/utils/cardStyleUtils";

interface RecentActivitiesProps {
  recentActivities: any[];
  onLogCardClick: (activity: any) => void;
  onEditActivity: (activity: any) => void;
  onQuickLogClick: () => void;
}

const RecentActivities = ({ 
  recentActivities, 
  onLogCardClick, 
  onEditActivity, 
  onQuickLogClick 
}: RecentActivitiesProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-center justify-between p-3 rounded-lg group cursor-pointer hover:brightness-95 transition-all ${getRecentActivityCardColorClasses(activity.type)}`}
              onClick={() => onLogCardClick(activity)}
            >
              <div className="flex-1">
                <p className="font-medium">{t(activity.type)}</p>
                <p className="text-sm opacity-80">{activity.rat} • {activity.time}</p>
                {activity.weight && (
                  <p className="text-xs opacity-70">{t("Weight")}: {activity.weight}g</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activity.behaviorTags && activity.behaviorTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {activity.behaviorTags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        className="bg-primary text-primary-foreground border-0 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : activity.status ? (
                  <Badge
                    className={`${getActivityStatusClasses(activity.status)} border-0`}
                  >
                    {t(activity.status)}
                  </Badge>
                ) : null}
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
          ))
        ) : (
          <div className="text-center py-4">
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
