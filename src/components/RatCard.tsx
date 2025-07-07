import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, Pencil } from "lucide-react";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { usePersonalityTags } from "@/hooks/usePersonalityTags";

interface RatCardProps {
  rat: any;
  personalityTags: any[];
  onHealthClick: (rat: any) => void;
  onTrackClick: (rat: any) => void;
  onEditClick: (rat: any) => void;
  onImageClick: (imageUrl: string) => void;
  updateRatPicture: (ratId: string, imageUrl: string) => void;
  editingRatImageId: string | null;
  setEditingRatImageId: (id: string | null) => void;
}

const RatCard = ({
  rat,
  personalityTags,
  onHealthClick,
  onTrackClick,
  onEditClick,
  onImageClick,
  updateRatPicture,
  editingRatImageId,
  setEditingRatImageId
}: RatCardProps) => {
  const { t } = useTranslation();

  const calculateAge = (birthday: string) => {
    const birth = new Date(birthday);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    return months > 0 ? t("{{count}} months", { count: months }) : t("{{count}} days", { count: diffDays });
  };

  const getStatusColorClasses = (status: string) => {
    if (status === "active") {
      return "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30";
    }
    return "bg-muted text-muted-foreground border-border";
  };

  // Updated function to get personality trait color from database with real-time updates
  const getPersonalityTraitColor = (traitName: string) => {
    // Use current personalityTags state to ensure real-time updates
    const matchingTag = personalityTags.find(tag => 
      tag.name.toLowerCase() === traitName.toLowerCase()
    );
    console.log('Looking for trait:', traitName, 'Found:', matchingTag); // Debug log
    return matchingTag?.color || '#6B7280'; // Default gray if not found
  };

  const getPersonalityColorClasses = (trait: any) => {
    // Return basic classes, color will be handled by inline styles
    return 'text-xs px-2 py-1 rounded-full border';
  };

  // Helper function to convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return undefined;
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Handle 6-digit hex
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return undefined;
  };

  const getPersonalityTraits = (personality: any): any[] => {
    if (!personality) return [];
    
    // If it's an array
    if (Array.isArray(personality)) {
      // Return the array as is, whether it contains strings or objects
      return personality.filter(trait => trait !== null && trait !== undefined);
    }
    
    // If it's a single object or string
    return [personality];
  };

  const personalityTraits = getPersonalityTraits(rat.personality);

  return (
    <Card
      className={`bg-card text-card-foreground border-border shadow-xl hover:shadow-2xl transition-all duration-300 ${rat.status === 'deceased' ? 'opacity-70 grayscale' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="relative group">
            <ProfilePictureUpload
              currentImage={rat.profile_picture}
              onImageUpdate={(imageUrl) => updateRatPicture(rat.id, imageUrl)}
              petName={rat.name}
              onImageClick={() => onImageClick(rat.profile_picture)}
              forceOpen={editingRatImageId === rat.id}
              onClose={() => setEditingRatImageId(null)}
            />
            <Button
              size="icon"
              variant="default" 
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg border-2 border-background hover:bg-primary/90"
              onClick={() => setEditingRatImageId(rat.id)}
            >
              <Pencil className="h-4 w-4 text-primary-foreground" />
            </Button>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColorClasses(rat.status)} border-2 border-background shadow-sm`}></div>
          </div>

          {/* Rat Info */}
          <div className={`flex-1 space-y-3`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-card-foreground">{rat.name}</h3>
                <p className="text-sm text-muted-foreground">{t(rat.sex)} • {calculateAge(rat.birthday)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getStatusColorClasses(rat.status)} text-xs`}
                >
                  {t(rat.status)}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditClick(rat)}
                  className="text-muted-foreground hover:text-accent-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Birthday */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{t("Born {{date}}", { date: new Date(rat.birthday).toLocaleDateString() })}</span>
            </div>

             {/* Personality Traits with real-time color updates */}
             {personalityTraits && personalityTraits.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {personalityTraits.map((trait: any, index: number) => {
                   const traitName = typeof trait === 'string' ? trait : (trait?.name || '');
                   // Always get the latest color from the current personalityTags state
                   const traitColor = typeof trait === 'object' && trait?.color 
                     ? trait.color 
                     : getPersonalityTraitColor(traitName);
                   
                   return (
                     <Badge 
                       key={`${rat.id}-${traitName}-${index}-${traitColor}`}
                       className={`${getPersonalityColorClasses(trait)} text-xs`}
                       style={{
                         backgroundColor: hexToRgba(traitColor, 0.2),
                         color: traitColor,
                         borderColor: hexToRgba(traitColor, 0.5)
                       }}
                     >
                       {t(traitName)}
                     </Badge>
                   );
                 })}
               </div>
             )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onHealthClick(rat)}
              >
                <Heart className="h-3 w-3 mr-1" />
                {t("Health")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTrackClick(rat)}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {t("Track")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatCard;