
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Heart, Share2, Plus, Send, Sparkles, MoreHorizontal } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const CommunityPage = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "RatParent123",
      avatar: "RP",
      timestamp: "2 hours ago",
      content: "My rat won't stop sneezing - should I be worried? Pepper has been sneezing for 2 days now. No other symptoms visible. Has anyone experienced this?",
      image: null,
      likes: 12,
      comments: [
        { id: 1, author: "VetExpert", content: "Could be dust or allergies. Monitor for other symptoms!", timestamp: "1 hour ago" },
        { id: 2, author: "RatMom2023", content: "Same happened to my rat. Turned out to be new bedding!", timestamp: "45 mins ago" }
      ],
      category: "health",
      liked: false,
    },
    {
      id: 2,
      author: "CaringOwner",
      avatar: "CO",
      timestamp: "5 hours ago",
      content: "Best bedding for sensitive rats? Looking for recommendations for hypoallergenic bedding. My rats seem to have reactions to wood shavings.",
      image: null,
      likes: 24,
      comments: [
        { id: 1, author: "NaturalRatCare", content: "Hemp bedding works great! Super absorbent and dust-free.", timestamp: "3 hours ago" },
        { id: 2, author: "EcoRatParent", content: "Paper-based bedding is my go-to for sensitive babies", timestamp: "2 hours ago" },
        { id: 3, author: "RatWhisperer", content: "Avoid cedar and pine - stick to aspen or paper", timestamp: "1 hour ago" }
      ],
      category: "environment",
      liked: true,
    },
    {
      id: 3,
      author: "CreativeRatDad",
      avatar: "CD",
      timestamp: "1 day ago",
      content: "DIY enrichment ideas that actually work! Just made cardboard castles for my rats and they're going CRAZY for them! 🏰 Here's what I used: old cardboard boxes, toilet paper tubes, and some safe tape. Total cost: $0! 💝",
      image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop",
      likes: 89,
      comments: [
        { id: 1, author: "DIYRatMom", content: "This is amazing! Definitely trying this weekend 😍", timestamp: "18 hours ago" },
        { id: 2, author: "BudgetRatCare", content: "Love free enrichment ideas! My wallet thanks you 🙏", timestamp: "12 hours ago" },
        { id: 3, author: "CraftyCritters", content: "Adding some hiding holes makes it even better!", timestamp: "8 hours ago" },
        { id: 4, author: "RatCastle", content: "My rats would destroy this in 5 minutes 😂", timestamp: "6 hours ago" }
      ],
      category: "environment",
      liked: false,
    },
  ]);

  const [newComment, setNewComment] = useState<{[key: number]: string}>({});

  const handleLike = (postId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleComment = (postId: number) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: [...post.comments, {
                id: post.comments.length + 1,
                author: "You",
                content: commentText,
                timestamp: "now"
              }]
            }
          : post
      )
    );
    setNewComment(prev => ({ ...prev, [postId]: "" }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return "bg-red-500/20 text-red-100 border-red-300/30";
      case "behavior":
        return "bg-blue-500/20 text-blue-100 border-blue-300/30";
      case "environment":
        return "bg-green-500/20 text-green-100 border-green-300/30";
      default:
        return "bg-gray-500/20 text-gray-100 border-gray-300/30";
    }
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
            <div className="p-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                Community
              </h1>
              <p className="text-sm text-pink-100/80">Connect with fellow rat parents</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-300">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Feed */}
      <div className="relative p-4 space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-white/20">
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{post.author}</h3>
                    <p className="text-xs text-purple-100/70">{post.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getCategoryColor(post.category)} backdrop-blur-sm border text-xs`}>
                    {post.category}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Post Content */}
              <p className="text-white leading-relaxed">{post.content}</p>
              
              {/* Post Image */}
              {post.image && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={post.image} 
                    alt="Post content" 
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-sm text-purple-100/70 border-t border-white/10 pt-3">
                <span>{post.likes} likes</span>
                <span>{post.comments.length} comments</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 border-t border-white/10 pt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleLike(post.id)}
                  className={`flex-1 ${post.liked ? 'text-red-400 hover:text-red-300' : 'text-white/70 hover:text-white'} hover:bg-white/10 transition-all duration-300`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${post.liked ? 'fill-current' : ''}`} />
                  Like
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-white/70 hover:text-white hover:bg-white/10">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-white/70 hover:text-white hover:bg-white/10">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {/* Comments Section */}
              {post.comments.length > 0 && (
                <div className="space-y-3 border-t border-white/10 pt-3">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs">
                          {comment.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 backdrop-blur-sm bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm">{comment.author}</span>
                          <span className="text-xs text-purple-100/60">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-purple-100/90">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Comment */}
              <div className="flex gap-3 mt-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs">
                    Y
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment[post.id] || ""}
                    onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                    className="backdrop-blur-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleComment(post.id)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Load More */}
        <div className="text-center py-8">
          <Button 
            variant="outline" 
            className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
          >
            Load More Posts
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CommunityPage;
