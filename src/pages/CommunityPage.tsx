
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Heart, Clock, Plus, Eye } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const CommunityPage = () => {
  const [posts] = useState([
    {
      id: 1,
      title: "My rat won't stop sneezing - should I be worried?",
      content: "Pepper has been sneezing for 2 days now. No other symptoms visible. Has anyone experienced this?",
      category: "health",
      author: "RatParent123",
      timestamp: "2 hours ago",
      replies: 5,
      likes: 3,
      views: 24,
    },
    {
      id: 2,
      title: "Best bedding for sensitive rats?",
      content: "Looking for recommendations for hypoallergenic bedding. My rats seem to have reactions to wood shavings.",
      category: "environment",
      author: "CaringOwner",
      timestamp: "5 hours ago",
      replies: 8,
      likes: 12,
      views: 67,
    },
    {
      id: 3,
      title: "Introducing new rat to established group",
      content: "I have 3 rats and want to add a 4th. What's the best introduction process? My current rats are very territorial.",
      category: "behavior",
      author: "NewRatMom",
      timestamp: "1 day ago",
      replies: 15,
      likes: 8,
      views: 103,
    },
    {
      id: 4,
      title: "DIY enrichment ideas that actually work",
      content: "Sharing some creative enrichment activities my rats absolutely love! Cardboard castles are a hit.",
      category: "environment",
      author: "CreativeRatDad",
      timestamp: "2 days ago",
      replies: 22,
      likes: 45,
      views: 189,
    },
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return "bg-red-100 text-red-700 border-red-200";
      case "behavior":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "environment":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const healthPosts = posts.filter(post => post.category === "health");
  const behaviorPosts = posts.filter(post => post.category === "behavior");
  const environmentPosts = posts.filter(post => post.category === "environment");

  const PostCard = ({ post }: { post: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-800 leading-tight mb-2">
              {post.title}
            </CardTitle>
            <Badge variant="outline" className={`${getCategoryColor(post.category)} text-xs`}>
              {post.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.content}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                {post.author[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{post.author}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.timestamp}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {post.replies}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Community</h1>
            <p className="text-sm text-gray-600">Connect with fellow rat parents</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            {healthPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
          
          <TabsContent value="behavior" className="space-y-4">
            {behaviorPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
          
          <TabsContent value="environment" className="space-y-4">
            {environmentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default CommunityPage;
