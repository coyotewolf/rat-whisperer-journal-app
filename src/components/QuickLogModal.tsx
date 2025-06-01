
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Heart, Scale, Thermometer, Pill, Coffee, Sparkles } from "lucide-react";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickLogModal = ({ isOpen, onClose }: QuickLogModalProps) => {
  const quickLogOptions = [
    { 
      id: "behavior", 
      icon: Activity, 
      label: "Behavior", 
      gradient: "from-blue-500 to-cyan-500",
      description: "Log interactions & activities" 
    },
    { 
      id: "health", 
      icon: Heart, 
      label: "Health Check", 
      gradient: "from-red-500 to-pink-500",
      description: "Record health observations" 
    },
    { 
      id: "weight", 
      icon: Scale, 
      label: "Weight", 
      gradient: "from-green-500 to-emerald-500",
      description: "Track weight changes" 
    },
    { 
      id: "environment", 
      icon: Thermometer, 
      label: "Environment", 
      gradient: "from-purple-500 to-violet-500",
      description: "Cage conditions & temp" 
    },
    { 
      id: "medication", 
      icon: Pill, 
      label: "Medication", 
      gradient: "from-yellow-500 to-orange-500",
      description: "Medicine & supplements" 
    },
    { 
      id: "feeding", 
      icon: Coffee, 
      label: "Feeding", 
      gradient: "from-orange-500 to-red-500",
      description: "Food & treats given" 
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 text-xl">
            <div className="p-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Quick Log Entry
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          {quickLogOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.id} 
                className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm bg-white/50 border-white/30 group"
              >
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${option.gradient} mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{option.label}</p>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="mt-6 backdrop-blur-sm bg-white/50 border-gray-300/50 hover:bg-white/70 transition-all duration-300"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLogModal;
