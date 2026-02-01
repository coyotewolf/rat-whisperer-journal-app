import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AddRatModal from "@/components/AddRatModal";
import EditRatModal from "@/components/EditRatModal";
import RatLogsModal from "@/components/RatLogsModal";
import RatCard from "@/components/RatCard";
import EmptyRatsState from "@/components/EmptyRatsState";
import UnauthenticatedRatsView from "@/components/UnauthenticatedRatsView";
import RatsHeader from "@/components/RatsHeader";
import { useAuth } from "@/hooks/useAuth";
import { usePersonalityTags } from "@/hooks/usePersonalityTags";
import { supabase } from "@/integrations/supabase/client";

const RatsPage = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { personalityTags, refetch: refetchPersonalityTags } = usePersonalityTags();
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

  // Enhanced effect to refresh rats when personality tags are updated
  useEffect(() => {
    if (user && personalityTags.length >= 0) {
      // Force complete refresh of rats data to ensure tags are properly updated
      fetchRats();
      console.log('Personality tags updated, refreshing rats data:', personalityTags);
    }
  }, [personalityTags, user]);

  // Force re-render when personality tags change by creating a dependency key
  const personalityTagsKey = personalityTags.map(tag => `${tag.id}-${tag.color}-${tag.name}`).join(',');

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
      
      const ratsData = (data || []) as any[];
      const activeRats = ratsData.filter(rat => rat.status === 'active' || !rat.is_deceased);
      const deceasedRats = ratsData.filter(rat => rat.status === 'deceased' || rat.is_deceased);

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
        .update({ profile_image_url: imageUrl } as any)
        .eq('id', ratId);
      
      if (!error) {
        setRats(prevRats => 
          prevRats.map(rat => 
            rat.id === ratId ? { ...rat, profile_image_url: imageUrl } : rat
          )
        );
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
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

  const handleRatUpdated = async () => {
    await fetchRats();
    await refetchPersonalityTags(); // Ensure personality tags are also refreshed
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-foreground">{t("Loading...")}</div>
    </div>;
  }

  if (!user) {
    return (
      <UnauthenticatedRatsView 
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      <RatsHeader onAddRat={() => setAddRatModalOpen(true)} />

      {/* Rats Grid */}
      <div className="relative p-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">{t("Loading your rats...")}</div>
        ) : (
          <div className="grid gap-4">
            {rats.map((rat) => (
              <RatCard
                key={`${rat.id}-${personalityTagsKey}`}
                rat={rat}
                personalityTags={personalityTags}
                onHealthClick={handleHealthClick}
                onTrackClick={handleTrackClick}
                onEditClick={handleEditClick}
                onImageClick={handleImageClick}
                updateRatPicture={updateRatPicture}
                editingRatImageId={editingRatImageId}
                setEditingRatImageId={setEditingRatImageId}
              />
            ))}

            {/* Empty State */}
            {rats.length === 0 && (
              <EmptyRatsState onAddRat={() => setAddRatModalOpen(true)} />
            )}
          </div>
        )}
      </div>

      <BottomNav />
      <AddRatModal 
        isOpen={addRatModalOpen} 
        onClose={() => setAddRatModalOpen(false)} 
        onRatAdded={handleRatUpdated}
      />
      <EditRatModal 
        isOpen={editRatModalOpen} 
        onClose={() => setEditRatModalOpen(false)} 
        onRatUpdated={handleRatUpdated}
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
