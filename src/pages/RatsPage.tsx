
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Sparkles, Edit, Heart, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AddRatModal from "@/components/AddRatModal";
import EditRatModal from "@/components/EditRatModal";
import RatLogsModal from "@/components/RatLogsModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";

interface Rat {
  id: string;
  name: string;
  sex: string;
  birthday: string;
  status: string;
  personality?: string[];
  profile_picture?: string;
}

const RatsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [rats, setRats] = useState<Rat[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedRat, setSelectedRat] = useState<Rat | null>(null);
  const [logTypes, setLogTypes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchRats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRats = async () => {
    try {
      const { data, error } = await supabase
        .from('rats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Rat interface
      const transformedRats = (data || []).map(rat => ({
        ...rat,
        personality: Array.isArray(rat.personality) 
          ? rat.personality as string[]
          : typeof rat.personality === 'string'
          ? [rat.personality]
          : []
      }));
      
      setRats(transformedRats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days old`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''} old`;
    }
  };

  const getPersonalityTagColor = (tag: string) => {
    // Simple hash function to generate consistent colors
    const hash = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-yellow-100 text-yellow-700',
      'bg-indigo-100 text-indigo-700',
      'bg-cyan-100 text-cyan-700'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleEditRat = (rat: Rat) => {
    setSelectedRat(rat);
    setEditModalOpen(true);
  };

  const handleHealthLogs = (rat: Rat) => {
    setSelectedRat(rat);
    setLogTypes(['health', 'weight', 'medication']);
    setLogsModalOpen(true);
  };

  const handleTrackLogs = (rat: Rat) => {
    setSelectedRat(rat);
    setLogTypes(['behavior', 'environment', 'feeding']);
    setLogsModalOpen(true);
  };

  const renderProfilePicture = (rat: Rat) => {
    const isActive = rat.status === 'active';
    
    if (rat.profile_picture?.startsWith('data:') || rat.profile_picture?.startsWith('http')) {
      return (
        <div className="relative">
          <img 
            src={rat.profile_picture} 
            alt={rat.name} 
            className="w-full h-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
        </div>
      );
    }
    
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xl font-bold">
        {rat.name[0].toUpperCase()}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
          isActive ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Header - Always visible */}
        <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  My Rats
                </h1>
                <p className="text-sm text-orange-100/80">Manage your rat family</p>
              </div>
            </div>
          </div>
        </div>

        {/* Not signed in message */}
        <div className="relative p-4 text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Sign in to manage your rats</h3>
          <p className="text-purple-100 mb-6">Create an account or sign in to add and track your furry friends!</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            Sign In / Sign Up
          </Button>
        </div>
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

      {/* Header - Always visible */}
      <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                My Rats
              </h1>
              <p className="text-sm text-orange-100/80">Manage your rat family</p>
            </div>
          </div>
          <Button 
            onClick={() => setAddModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rat
          </Button>
        </div>
      </div>

      {/* Rats Grid */}
      <div className="relative p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white text-lg">Loading rats...</div>
          </div>
        ) : rats.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No rats yet</h3>
            <p className="text-purple-100 mb-4">Add your first rat to get started!</p>
            <Button 
              onClick={() => setAddModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Rat
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {rats.map((rat) => (
              <Card 
                key={rat.id} 
                className={`backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl relative ${
                  rat.status === 'deceased' ? 'after:absolute after:inset-0 after:bg-gray-400/30 after:rounded-xl after:pointer-events-none' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg flex-shrink-0 relative">
                      {renderProfilePicture(rat)}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute bottom-0 right-0 w-6 h-6 p-0 bg-white/80 hover:bg-white rounded-full"
                        onClick={() => handleEditRat(rat)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{rat.name}</h3>
                          <Badge className="bg-blue-500/20 text-blue-100 border-blue-300 border backdrop-blur-sm">
                            {rat.sex}
                          </Badge>
                          <Badge className={`border backdrop-blur-sm ${
                            rat.status === 'active' 
                              ? 'bg-green-500/20 text-green-100 border-green-300' 
                              : 'bg-gray-500/20 text-gray-100 border-gray-300'
                          }`}>
                            {rat.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRat(rat)}
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-purple-100 mb-3">{calculateAge(rat.birthday)}</p>
                      
                      {/* Personality Tags */}
                      {rat.personality && rat.personality.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {rat.personality.slice(0, 5).map((tag, index) => (
                            <Badge 
                              key={index} 
                              className={`text-xs ${getPersonalityTagColor(tag)} border-0`}
                            >
                              {tag}
                            </Badge>
                          ))}
                          {rat.personality.length > 5 && (
                            <Badge className="text-xs bg-gray-100 text-gray-700 border-0">
                              +{rat.personality.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHealthLogs(rat)}
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Health
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTrackLogs(rat)}
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddRatModal 
        isOpen={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onRatAdded={fetchRats}
      />
      
      <EditRatModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onRatUpdated={fetchRats}
        rat={selectedRat}
      />
      
      <RatLogsModal
        isOpen={logsModalOpen}
        onClose={() => setLogsModalOpen(false)}
        ratId={selectedRat?.id || ''}
        ratName={selectedRat?.name || ''}
        logTypes={logTypes}
      />
    </div>
  );
};

export default RatsPage;
