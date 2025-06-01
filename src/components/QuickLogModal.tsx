
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Heart, Scale, Thermometer, Pill, Coffee } from "lucide-react";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickLogModal = ({ isOpen, onClose }: QuickLogModalProps) => {
  const quickLogOptions = [
    { id: "behavior", icon: Activity, label: "Behavior", color: "bg-blue-100 text-blue-700" },
    { id: "health", icon: Heart, label: "Health Check", color: "bg-red-100 text-red-700" },
    { id: "weight", icon: Scale, label: "Weight", color: "bg-green-100 text-green-700" },
    { id: "environment", icon: Thermometer, label: "Environment", color: "bg-purple-100 text-purple-700" },
    { id: "medication", icon: Pill, label: "Medication", color: "bg-yellow-100 text-yellow-700" },
    { id: "feeding", icon: Coffee, label: "Feeding", color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Log Entry</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {quickLogOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg ${option.color} mb-2`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{option.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLogModal;
