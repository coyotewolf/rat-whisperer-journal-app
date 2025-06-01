
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const articles = [
    {
      id: 1,
      title: "Understanding Rat Social Hierarchy",
      summary: "Learn about dominance behaviors and how to maintain harmony in your rat colony.",
      tags: ["behavior", "dominance", "social"],
      readTime: "5 min",
      category: "Behavior",
    },
    {
      id: 2,
      title: "Respiratory Illness in Rats: Early Detection",
      summary: "Recognize the signs of respiratory problems and when to seek veterinary care.",
      tags: ["health", "respiratory", "symptoms"],
      readTime: "7 min",
      category: "Health",
    },
    {
      id: 3,
      title: "Creating Enrichment Activities",
      summary: "Fun and engaging activities to keep your rats mentally stimulated.",
      tags: ["enrichment", "activities", "mental health"],
      readTime: "4 min",
      category: "Care",
    },
    {
      id: 4,
      title: "Proper Nutrition for Different Life Stages",
      summary: "Feeding guidelines for young, adult, and senior rats.",
      tags: ["nutrition", "feeding", "diet"],
      readTime: "6 min",
      category: "Nutrition",
    },
    {
      id: 5,
      title: "Aggressive Behavior: Causes and Solutions",
      summary: "Understanding and managing aggressive behaviors in pet rats.",
      tags: ["aggression", "behavior", "training"],
      readTime: "8 min",
      category: "Behavior",
    },
    {
      id: 6,
      title: "Setting Up the Perfect Rat Cage",
      summary: "Essential tips for creating a comfortable and safe living space.",
      tags: ["housing", "environment", "setup"],
      readTime: "5 min",
      category: "Environment",
    },
  ];

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = ["All", "Behavior", "Health", "Care", "Nutrition", "Environment"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categoryFilteredArticles = selectedCategory === "All" 
    ? filteredArticles 
    : filteredArticles.filter(article => article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header */}
      <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                RatTales Library
              </h1>
              <p className="text-sm text-emerald-100/80">Knowledge base for rat care</p>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
          <Input
            placeholder="Search articles, tags, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 backdrop-blur-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20"
          />
        </div>
      </div>

      <div className="relative p-4">
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category 
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0" 
                  : "backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {categoryFilteredArticles.map((article) => (
            <Card key={article.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-white leading-tight">
                    {article.title}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2 shrink-0 backdrop-blur-sm bg-white/20 text-white border-0">
                    {article.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100/90 text-sm mb-3">{article.summary}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs backdrop-blur-sm bg-white/5 border-white/20 text-white/80">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1 text-purple-100/70 text-xs">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categoryFilteredArticles.length === 0 && (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-purple-100/80">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LibraryPage;
