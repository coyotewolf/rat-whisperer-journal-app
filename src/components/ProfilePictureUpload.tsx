
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, Edit, Trash2, Heart, Star } from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
  petName?: string;
}

const ProfilePictureUpload = ({ currentImage, onImageUpdate, petName = "Your Rat" }: ProfilePictureUploadProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAvatars = [
    { id: "rat1", emoji: "🐭", bg: "bg-gradient-to-br from-pink-400 to-purple-500" },
    { id: "rat2", emoji: "🐀", bg: "bg-gradient-to-br from-blue-400 to-cyan-500" },
    { id: "rat3", emoji: "🐹", bg: "bg-gradient-to-br from-orange-400 to-red-500" },
    { id: "rat4", emoji: "🎭", bg: "bg-gradient-to-br from-green-400 to-blue-500" },
    { id: "rat5", emoji: "👑", bg: "bg-gradient-to-br from-yellow-400 to-orange-500" },
    { id: "rat6", emoji: "🌟", bg: "bg-gradient-to-br from-purple-400 to-pink-500" },
  ];

  // Some default rat images that can be used
  const defaultImages = [
    "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501286353178-1ec881214838?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=400&h=400&fit=crop"
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setIsModalOpen(false);
        setIsCropModalOpen(true);
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
        setIsModalOpen(false);
        setIsCropModalOpen(true);
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

  const handleCroppedImage = (croppedImageUrl: string) => {
    onImageUpdate(croppedImageUrl);
    setIsCropModalOpen(false);
    setPreviewImage(null);
  };

  const selectDefaultAvatar = (avatar: typeof defaultAvatars[0]) => {
    onImageUpdate(avatar.id);
    setIsModalOpen(false);
  };

  const selectDefaultImage = (imageUrl: string) => {
    onImageUpdate(imageUrl);
    setIsModalOpen(false);
  };

  const renderProfilePicture = () => {
    if (currentImage?.startsWith('data:') || currentImage?.startsWith('http')) {
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
      <div className="relative group">
        <div 
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transform transition-all duration-300 group-hover:scale-105"
          onClick={() => setIsModalOpen(true)}
        >
          {renderProfilePicture()}
        </div>
        
        <Button
          size="icon"
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg border-2 border-white"
          onClick={() => setIsModalOpen(true)}
        >
          <Edit className="h-4 w-4 text-white" />
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-center text-white">
              Update {petName}'s Photo
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload Area */}
            <Card 
              className={`transition-all duration-300 bg-white/10 border-white/20 ${isDragging ? 'border-orange-500 bg-orange-50/10' : 'border-dashed'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Drag & drop a photo here</p>
                    <p className="text-xs text-gray-300">or click to browse</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Default Images */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-center text-white">Choose from default images</h3>
              <div className="grid grid-cols-2 gap-3">
                {defaultImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => selectDefaultImage(imageUrl)}
                    className="w-full h-20 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 shadow-lg border-2 border-white/20 hover:border-orange-300"
                  >
                    <img src={imageUrl} alt={`Default ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Default Avatars */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-center text-white">Or choose a cute avatar</h3>
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
                className="w-full text-red-300 border-red-200/20 hover:bg-red-50/10 bg-white/10"
                onClick={() => {
                  onImageUpdate("");
                  setIsModalOpen(false);
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

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setPreviewImage(null);
        }}
        imageUrl={previewImage || ''}
        onCropComplete={handleCroppedImage}
      />
    </>
  );
};

export default ProfilePictureUpload;
