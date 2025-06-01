
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Calendar, MapPin, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";

const RatsPage = () => {
  const [rats, setRats] = useState([
    {
      id: 1,
      name: "Pepper",
      sex: "Female",
      birthday: "2023-01-15",
      age: "11 months",
      status: "active",
      personality: ["Curious", "Playful", "Social"],
      profilePicture: "rat1"
    },
    {
      id: 2,
      name: "Salt",
      sex: "Male",
      birthday: "2023-02-20",
      age: "10 months",
      status: "active",
      personality: ["Calm", "Gentle", "Sleepy"],
      profilePicture: "rat2"
    },
    {
      id: 3,
      name: "Cinnamon",
      sex: "Female",
      birthday: "2022-08-10",
      age: "16 months",
      status: "deceased",
      personality: ["Brave", "Leader", "Protective"],
      profilePicture: "rat3"
    }
  ]);

  const updateRatPicture = (ratId: number, imageUrl: string) => {
    setRats(prevRats => 
      prevRats.map(rat => 
        rat.id === ratId ? { ...rat, profilePicture: imageUrl } : rat
      )
    );
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
                My Rats
              </h1>
              <p className="text-sm text-purple-100/80">Manage your furry family</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Rat
          </Button>
        </div>
      </div>

      {/* Rats Grid */}
      <div className="relative p-4">
        <div className="grid gap-4">
          {rats.map((rat) => (
            <Card key={rat.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Profile Picture */}
                  <div className="relative">
                    <ProfilePictureUpload
                      currentImage={rat.profilePicture}
                      onImageUpdate={(imageUrl) => updateRatPicture(rat.id, imageUrl)}
                      petName={rat.name}
                    />
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(rat.status)} border-2 border-white shadow-sm`}></div>
                  </div>

                  {/* Rat Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">{rat.name}</h3>
                        <p className="text-sm text-purple-100">{rat.sex} • {rat.age}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${rat.status === 'active' ? 'border-green-300 text-green-100' : 'border-gray-300 text-gray-200'} backdrop-blur-sm`}
                      >
                        {rat.status}
                      </Badge>
                    </div>

                    {/* Birthday */}
                    <div className="flex items-center gap-2 text-blue-100">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Born {new Date(rat.birthday).toLocaleDateString()}</span>
                    </div>

                    {/* Personality Traits */}
                    <div className="flex flex-wrap gap-2">
                      {rat.personality.map((trait, index) => (
                        <Badge 
                          key={index} 
                          className={`${getPersonalityColor(trait)} border-0 text-xs backdrop-blur-sm`}
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Heart className="h-3 w-3 mr-1" />
                        Health
                      </Button>
                      <Button size="sm" variant="outline" className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <MapPin className="h-3 w-3 mr-1" />
                        Track
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {rats.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No rats yet</h3>
            <p className="text-purple-100 mb-4">Add your first furry friend to get started!</p>
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Rat
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default RatsPage;
