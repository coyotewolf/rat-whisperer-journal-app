import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Added Dialog and DialogContent
import { Plus, Heart, Calendar, MapPin, Sparkles, Edit, Trash2, Pencil, ArrowLeft } from "lucide-react";
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
  const [editingRatImageId, setEditingRatImageId] = useState<string | null>(null); // State to control which rat's image is being edited
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

      // Sort active rats by created_at (descending)
      activeRats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      // Deceased rats maintain their original relative order within their group
      // and are appended to the end of the active rats.
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

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500" : "bg-gray-500";
  };

  const getPersonalityColor = (trait: string) => {
    const colors = {
      "Curious": "bg-blue-100 text-blue-700",
      "Playful": "bg-pink-100 text-pink-700",
      "Social": "bg-purple-100 text-purple-700",
      "Calm": "bg-green-100 text-green-700",
      "Gentle": "bg-cyan-100 text-cyan-700",
      "Sleepy": "bg-gray-100 text-gray-700",
      "Brave": "bg-orange-100 text-orange-700",
      "Leader": "bg-red-100 text-red-700",
      "Protective": "bg-yellow-100 text-yellow-700"
    };
    return colors[trait as keyof typeof colors] || "bg-gray-100 text-gray-700";
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
    return <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
      <div className="text-white">{t("Loading...")}</div>
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header */}
        <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  {t("My Rats")}
                </h1>
                <p className="text-sm text-purple-100/80">{t("Manage your furry family")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-4 text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{t("Sign in to manage your rats")}</h3>
          <p className="text-purple-100 mb-4">{t("Create an account or sign in to add and track your furry friends!")}</p>
          <Button
            onClick={() => setAuthModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header */}
      <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                {t("My Rats")}
              </h1>
              <p className="text-sm text-purple-100/80">{t("Manage your furry family")}</p>
            </div>
          </div>
          <Button 
            onClick={() => setAddRatModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Rat")}
          </Button>
        </div>
      </div>

      {/* Rats Grid */}
      <div className="relative p-4">
        {loading ? (
          <div className="text-center text-white py-8">{t("Loading your rats...")}</div>
        ) : (
          <div className="grid gap-4">
            {rats.map((rat) => (
              <Card
                key={rat.id}
                className={`backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 ${rat.status === 'deceased' ? 'opacity-70' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    <div className="relative group">
                      <ProfilePictureUpload
                        currentImage={rat.profile_picture}
                        onImageUpdate={(imageUrl) => updateRatPicture(rat.id, imageUrl)}
                        petName={rat.name}
                        onImageClick={() => handleImageClick(rat.profile_picture)} // For image preview
                        forceOpen={editingRatImageId === rat.id} // Trigger image edit modal
                        onClose={() => setEditingRatImageId(null)} // Reset state when modal closes
                      />
                      {/* This button now triggers the image edit modal for the specific rat */}
                      <Button
                        size="icon"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg border-2 border-white"
                        onClick={() => setEditingRatImageId(rat.id)} // Opens image edit modal
                      >
                        <Pencil className="h-4 w-4 text-white" />
                      </Button>
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(rat.status)} border-2 border-white shadow-sm`}></div>
                    </div>

                    {/* Rat Info */}
                    <div className={`flex-1 space-y-3 ${rat.status === 'deceased' ? 'grayscale' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">{rat.name}</h3>
                          <p className="text-sm text-purple-100">{t(rat.sex)} • {calculateAge(rat.birthday)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${rat.status === 'active' ? 'border-green-300 text-green-100' : 'border-gray-300 text-gray-200'} backdrop-blur-sm`}
                          >
                            {t(rat.status)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(rat)}
                            className="text-white hover:bg-white/20"
                          >
                            <Pencil className="h-4 w-4" /> {/* Changed to Pencil */}
                          </Button>
                        </div>
                      </div>

                      {/* Birthday */}
                      <div className="flex items-center gap-2 text-blue-100">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{t("Born {{date}}", { date: new Date(rat.birthday).toLocaleDateString() })}</span>
                      </div>

                      {/* Personality Traits */}
                      {rat.personality && rat.personality.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rat.personality.map((trait: string, index: number) => (
                            <Badge 
                              key={index} 
                              className={`${getPersonalityColor(trait)} border-0 text-xs backdrop-blur-sm`}
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
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          {t("Health")}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleTrackClick(rat)}
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {t("Track")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {rats.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{t("No rats yet")}</h3>
                <p className="text-purple-100 mb-4">{t("Add your first furry friend to get started!")}</p>
                <Button
                  onClick={() => setAddRatModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
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
              className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
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
