
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Heart, Calendar, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const RatsPage = () => {
  const [rats] = useState([
    {
      id: 1,
      name: "Pepper",
      sex: "Female",
      birthday: "2023-01-15",
      age: "18 months",
      personality: ["Curious", "Playful", "Social"],
      status: "active",
      photo: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Salt",
      sex: "Male",
      birthday: "2023-03-20",
      age: "16 months",
      personality: ["Calm", "Gentle", "Sleepy"],
      status: "active",
      photo: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Cinnamon",
      sex: "Female",
      birthday: "2022-08-10",
      age: "22 months",
      personality: ["Leader", "Protective", "Smart"],
      status: "deceased",
      photo: "/placeholder.svg",
    },
  ]);

  const calculateAge = (birthday: string) => {
    const birth = new Date(birthday);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return `${months} months`;
  };

  const activeRats = rats.filter(rat => rat.status === "active");
  const deceasedRats = rats.filter(rat => rat.status === "deceased");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Rats</h1>
            <p className="text-sm text-gray-600">{activeRats.length} active rats</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Rat
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Rats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Active Rats
          </h2>
          <div className="space-y-3">
            {activeRats.map((rat) => (
              <Card key={rat.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={rat.photo} alt={rat.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 text-lg font-semibold">
                        {rat.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{rat.name}</h3>
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {calculateAge(rat.birthday)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {rat.sex}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(rat.birthday).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {rat.personality.map((trait, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Deceased Rats */}
        {deceasedRats.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-600 mb-3">
              Remembered Rats
            </h2>
            <div className="space-y-3">
              {deceasedRats.map((rat) => (
                <Card key={rat.id} className="opacity-75 border-gray-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-16 w-16 grayscale">
                        <AvatarImage src={rat.photo} alt={rat.name} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-semibold">
                          {rat.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-600">{rat.name}</h3>
                          <Badge variant="outline" className="border-gray-400 text-gray-600">
                            {calculateAge(rat.birthday)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {rat.sex}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(rat.birthday).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {rat.personality.map((trait, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-400 text-gray-500">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default RatsPage;
