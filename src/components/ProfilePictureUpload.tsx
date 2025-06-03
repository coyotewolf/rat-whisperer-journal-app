
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, Edit, Trash2, Heart, Star, ArrowLeft } from "lucide-react"; // Import ArrowLeft icon

import { useEffect } from "react"; // Added useEffect

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
  petName?: string;
  onImageClick?: (imageUrl: string) => void; // For image preview
  forceOpen?: boolean; // To trigger modal from parent
  onClose?: () => void; // Callback when modal is closed
}

const ProfilePictureUpload = ({
  currentImage,
  onImageUpdate,
  petName = "Your Rat",
  onImageClick,
  forceOpen,
  onClose
}: ProfilePictureUploadProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsModalOpen(true);
    }
  }, [forceOpen]);

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      onClose?.(); // Call onClose when modal is closed by any means
      setPreviewImage(null); // Reset preview image when modal closes
    }
  };

  const defaultAvatars = [
    { id: "rat1", emoji: "🐭", bg: "bg-gradient-to-br from-pink-400 to-purple-500" },
    { id: "rat2", emoji: "🐀", bg: "bg-gradient-to-br from-blue-400 to-cyan-500" },
    { id: "rat3", emoji: "🐹", bg: "bg-gradient-to-br from-orange-400 to-red-500" },
    { id: "rat4", emoji: "🎭", bg: "bg-gradient-to-br from-green-400 to-blue-500" },
    { id: "rat5", emoji: "👑", bg: "bg-gradient-to-br from-yellow-400 to-orange-500" },
    { id: "rat6", emoji: "🌟", bg: "bg-gradient-to-br from-purple-400 to-pink-500" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const saveImage = () => {
    if (previewImage) {
      onImageUpdate(previewImage);
      handleModalOpenChange(false); // Use centralized close logic
    }
  };

  const selectDefaultAvatar = (avatar: typeof defaultAvatars[0]) => {
    onImageUpdate(avatar.id);
    handleModalOpenChange(false); // Use centralized close logic
  };

  const renderProfilePicture = () => {
    if (currentImage?.startsWith('data:')) {
      return (
        <img 
          src={currentImage} 
          alt={petName}
          className="w-full h-full object-cover"
        />
      );
    }
    
    const defaultAvatar = defaultAvatars.find(a => a.id === currentImage);
    if (defaultAvatar) {
      return (
        <div className={`w-full h-full flex items-center justify-center ${defaultAvatar.bg}`}>
          <span className="text-4xl">{defaultAvatar.emoji}</span>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
        <Camera className="h-8 w-8 text-gray-600" />
      </div>
    );
  };

  return (
    <>
      <div
        className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transform transition-all duration-300 group-hover:scale-105"
        onClick={() => {
          if (onImageClick && currentImage) {
            onImageClick(currentImage);
          }
        }}
      >
        {renderProfilePicture()}
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/80">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModalOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <DialogTitle className="flex-1 text-center">
                Update {petName}'s Photo
              </DialogTitle>
              <div className="w-10"></div> {/* Placeholder to balance the back button */}
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload Area */}
            <Card 
              className={`transition-all duration-300 ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-dashed border-gray-300'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drag & drop a photo here</p>
                    <p className="text-xs text-gray-500">or click to browse</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {previewImage && (
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-orange-200">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={saveImage} className="bg-gradient-to-r from-orange-500 to-pink-500">
                    <Heart className="h-4 w-4 mr-2" />
                    Save Photo
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewImage(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Default Avatars */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-center">Or choose a cute avatar</h3>
              <div className="grid grid-cols-3 gap-3">
                {defaultAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => selectDefaultAvatar(avatar)}
                    className={`w-16 h-16 rounded-full ${avatar.bg} flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg`}
                  >
                    <span className="text-2xl">{avatar.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Remove Photo */}
            {currentImage && (
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  onImageUpdate("");
                  handleModalOpenChange(false); // Use centralized close logic
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Photo
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUpload;
