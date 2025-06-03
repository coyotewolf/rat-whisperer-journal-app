
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PersonalityTagManager from "@/components/PersonalityTagManager";

interface PersonalityTagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
}

const PersonalityTagManagerModal = ({ isOpen, onClose, selectedTags, onTagsChange, onSave }: PersonalityTagManagerModalProps) => {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-white/95 backdrop-blur-sm border-white/20">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg bg-gray-100 hover:bg-gray-200 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1">Manage Personality Tags</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <PersonalityTagManager
            selectedTags={selectedTags}
            onTagsChange={onTagsChange}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Save Tags
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalityTagManagerModal;
