
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">RatTales Library</h1>
            <p className="text-sm text-gray-600">Knowledge base for rat care</p>
          </div>
          <BookOpen className="h-6 w-6 text-orange-500" />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles, tags, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4">
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap ${
                selectedCategory === category 
                  ? "bg-orange-500 hover:bg-orange-600" 
                  : "hover:bg-orange-50"
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
            <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-gray-800 leading-tight">
                    {article.title}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {article.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{article.summary}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
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
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No articles found matching your search.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LibraryPage;
