
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Heart, Calendar, MapPin, Sparkles, Pencil, ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import AuthModal from "@/components/AuthModal";
import AddRatModal from "@/components/AddRatModal";
import EditRatModal from "@/components/EditRatModal";
import RatLogsModal from "@/components/RatLogsModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const RatsPage = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addRatModalOpen, setAddRatModalOpen] = useState(false);
  const [editRatModalOpen, setEditRatModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedRat, setSelectedRat] = useState<any>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [editingRatImageId, setEditingRatImageId] = useState<string | null>(null);
  const [logTypes, setLogTypes] = useState<string[]>([]);
  const [rats, setRats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRats();
    }
  }, [user]);

  const fetchRats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const activeRats = data?.filter(rat => rat.status === 'active') || [];
      const deceasedRats = data?.filter(rat => rat.status === 'deceased') || [];

      activeRats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRats([...activeRats, ...deceasedRats]);
    } catch (error) {
      console.error('Error fetching rats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRatPicture = async (ratId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('rats')
        .update({ profile_picture: imageUrl })
        .eq('id', ratId);
      
      if (!error) {
        setRats(prevRats => 
          prevRats.map(rat => 
            rat.id === ratId ? { ...rat, profile_picture: imageUrl } : rat
          )
        );
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

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

  const getPersonalityColorClasses = (trait: string) => {
    const traitColorMap: { [key: string]: string } = {
      "Curious": "bg-primary/10 text-primary border border-primary/30",
      "Playful": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30",
      "Social": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30",
      "Calm": "bg-accent/10 text-accent-foreground border border-accent/30",
      "Gentle": "bg-secondary/10 text-secondary-foreground border border-secondary/30",
      "Sleepy": "bg-muted/50 text-muted-foreground border-border",
      "Brave": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30",
      "Leader": "bg-destructive/10 text-destructive-foreground border border-destructive/30",
      "Protective": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30"
    };
    return traitColorMap[trait] || "bg-muted/50 text-muted-foreground border-border";
  };

  // Helper function to extract personality traits from rat.personality
  const getPersonalityTraits = (personality: any): string[] => {
    if (!personality) return [];
    
    // If it's already an array of strings
    if (Array.isArray(personality)) {
      return personality.filter(trait => typeof trait === 'string');
    }
    
    // If it's an array of objects with name property
    if (Array.isArray(personality)) {
      return personality
        .filter(trait => trait && typeof trait === 'object' && trait.name)
        .map(trait => trait.name);
    }
    
    // If it's a single object with name property
    if (typeof personality === 'object' && personality.name) {
      return [personality.name];
    }
    
    // If it's a string
    if (typeof personality === 'string') {
      return [personality];
    }
    
    return [];
  };

  const handleHealthClick = (rat: any) => {
    setSelectedRat(rat);
    setLogTypes(['health', 'weight', 'medication']);
    setLogsModalOpen(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setImagePreviewUrl(imageUrl);
    setShowImagePreview(true);
  };

  const handleTrackClick = (rat: any) => {
    setSelectedRat(rat);
    setLogTypes(['behavior', 'environment', 'feeding']);
    setLogsModalOpen(true);
  };

  const handleEditClick = (rat: any) => {
    setSelectedRat(rat);
    setEditRatModalOpen(true);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-foreground">{t("Loading...")}</div>
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20 relative">
        {/* Header */}
        <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary shadow-lg">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {t("My Rats")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("Manage your furry family")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-4 text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">{t("Sign in to manage your rats")}</h3>
          <p className="text-muted-foreground mb-4">{t("Create an account or sign in to add and track your furry friends!")}</p>
          <Button
            onClick={() => setAuthModalOpen(true)}
            variant="default"
          >
            {t("Sign In / Sign Up")}
          </Button>
        </div>

        <BottomNav />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      {/* Header */}
      <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary shadow-lg">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {t("My Rats")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("Manage your furry family")}</p>
            </div>
          </div>
          <Button 
            onClick={() => setAddRatModalOpen(true)}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Rat")}
          </Button>
        </div>
      </div>

      {/* Rats Grid */}
      <div className="relative p-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">{t("Loading your rats...")}</div>
        ) : (
          <div className="grid gap-4">
            {rats.map((rat) => {
              const personalityTraits = getPersonalityTraits(rat.personality);
              
              return (
                <Card
                  key={rat.id}
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
                          onImageClick={() => handleImageClick(rat.profile_picture)}
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
                              onClick={() => handleEditClick(rat)}
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

                        {/* Personality Traits */}
                        {personalityTraits && personalityTraits.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {personalityTraits.map((trait: string, index: number) => (
                              <Badge 
                                key={index} 
                                className={`${getPersonalityColorClasses(trait)} text-xs`}
                              >
                                {t(trait)}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleHealthClick(rat)}
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {t("Health")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrackClick(rat)}
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
            })}

            {/* Empty State */}
            {rats.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t("No rats yet")}</h3>
                <p className="text-muted-foreground mb-4">{t("Add your first furry friend to get started!")}</p>
                <Button
                  onClick={() => setAddRatModalOpen(true)}
                  variant="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("Add Your First Rat")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
      <AddRatModal 
        isOpen={addRatModalOpen} 
        onClose={() => setAddRatModalOpen(false)} 
        onRatAdded={fetchRats}
      />
      <EditRatModal 
        isOpen={editRatModalOpen} 
        onClose={() => setEditRatModalOpen(false)} 
        onRatUpdated={fetchRats}
        rat={selectedRat}
      />
      <RatLogsModal
        isOpen={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        ratId={selectedRat?.id || null}
        ratName={selectedRat?.name || ""}
        logTypes={logTypes}
      />

      {/* Image Preview Modal (Lightbox) */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background/80 border-none shadow-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt={t("Profile Preview")}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl"
              />
            )}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 left-4 h-10 w-10 rounded-full text-foreground hover:bg-accent/50 focus-visible:ring-ring focus-visible:ring-offset-0"
              onClick={() => setShowImagePreview(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatsPage;
