
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Calendar, User, FileText, Activity } from "lucide-react";
import { format } from "date-fns";
import { getHealthStatusEmoji } from "@/utils/cardStyleUtils";

interface LogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logEntry: any;
  onEdit: (log: any) => void;
}

const LogDetailModal = ({ isOpen, onClose, logEntry, onEdit }: LogDetailModalProps) => {
  const { t } = useTranslation();

  if (!logEntry) return null;

  const handleEdit = () => {
    onEdit(logEntry);
    onClose();
  };

  const renderLogContent = () => {
    switch (logEntry.type) {
      case 'behavior':
        return (
          <div className="space-y-3">
            {logEntry.behavior && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Behavior")}</h4>
                <p className="text-foreground">{logEntry.behavior}</p>
              </div>
            )}
            {logEntry.hashtags && logEntry.hashtags.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">{t("Tags")}</h4>
                <div className="flex flex-wrap gap-1">
                  {logEntry.hashtags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'weight':
        return (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Weight")}</h4>
            <p className="text-foreground text-lg font-semibold">{logEntry.weight}g</p>
          </div>
        );
      case 'health':
        return (
          <div className="space-y-3">
            {logEntry.status && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Health Status")}</h4>
                <Badge variant="outline" className="text-sm flex items-center gap-1">
                  {t(logEntry.status)}
                  {getHealthStatusEmoji(logEntry.status) && (
                    <span>{getHealthStatusEmoji(logEntry.status)}</span>
                  )}
                </Badge>
              </div>
            )}
            {logEntry.symptoms && logEntry.symptoms.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">{t("Symptoms")}</h4>
                <div className="flex flex-wrap gap-1">
                  {logEntry.symptoms.map((symptom: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'medication':
        return (
          <div className="space-y-3">
            {logEntry.medication && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Medication")}</h4>
                <p className="text-foreground font-medium">{logEntry.medication}</p>
              </div>
            )}
            {logEntry.dose && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Dose")}</h4>
                <p className="text-foreground">{logEntry.dose}</p>
              </div>
            )}
          </div>
        );
      case 'feeding':
        return (
          <div className="space-y-3">
            {logEntry.food && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Food")}</h4>
                <p className="text-foreground font-medium">{logEntry.food}</p>
              </div>
            )}
            {logEntry.amount && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Amount")}</h4>
                <p className="text-foreground">{logEntry.amount}</p>
              </div>
            )}
          </div>
        );
      case 'environment':
        return (
          <div className="space-y-3">
            {logEntry.temperature && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Temperature")}</h4>
                <p className="text-foreground">{logEntry.temperature}°C</p>
              </div>
            )}
            {logEntry.humidity && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{t("Humidity")}</h4>
                <p className="text-foreground">{logEntry.humidity}%</p>
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-muted-foreground">{t("No additional details available")}</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center capitalize">
              {t("{{logType}} Log Details", { logType: t(logEntry.type) })}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-muted-foreground hover:text-primary"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Basic Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t("Basic Information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("Rats")}:</span>
                <span className="font-medium">
                  {logEntry.ratNames ? logEntry.ratNames.join(', ') : t('Unknown')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("Date")}:</span>
                <span className="font-medium">
                  {format(new Date(logEntry.timestamp), "PPp")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Log Content Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("Details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {renderLogContent()}
            </CardContent>
          </Card>

          {/* Notes Card */}
          {logEntry.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t("Notes")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-foreground text-sm leading-relaxed">{logEntry.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailModal;
