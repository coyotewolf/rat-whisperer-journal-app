
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";

interface Activity {
  id: number;
  type: string;
  rat: string;
  time: string;
  status: string;
}

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  activity: Activity | null;
}

const ActivityDetailModal = ({ isOpen, onClose, onEdit, activity }: ActivityDetailModalProps) => {
  if (!activity) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/20 text-green-100 border-green-300';
      case 'completed': return 'bg-blue-500/20 text-blue-100 border-blue-300';
      case 'stable': return 'bg-yellow-500/20 text-yellow-100 border-yellow-300';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90 backdrop-blur-md border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg bg-gray-100 hover:bg-gray-200 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1 text-center text-white">Activity Details</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="rounded-lg bg-orange-100 hover:bg-orange-200 p-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Type</label>
            <p className="text-lg font-semibold text-white">{activity.type}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300">Rat</label>
            <p className="text-lg text-white">{activity.rat}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300">Time</label>
            <p className="text-lg text-white">{activity.time}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300">Status</label>
            <Badge className={`${getStatusColor(activity.status)} border backdrop-blur-sm`}>
              {activity.status}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailModal;
