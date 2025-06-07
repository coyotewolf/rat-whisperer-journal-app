
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
    <div className="min-h-screen bg-background text-foreground pb-20 relative"> {/* Themed background */}
      {/* Animated Background - Consider removing or theming if kept */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div> */}
      {/* SVG background - color needs to be themed if kept */}
      {/* <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div> */}

      {/* Header */}
      <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg"> {/* Themed Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary shadow-lg"> {/* Themed icon bg */}
              <BookOpen className="h-6 w-6 text-primary-foreground" /> {/* Themed icon color */}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary"> {/* Themed title */}
                RatTales Library
              </h1>
              <p className="text-sm text-muted-foreground">Knowledge base for rat care</p> {/* Themed subtitle */}
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /> {/* Themed icon */}
          <Input
            placeholder="Search articles, tags, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10" // Standard Input component will be themed
          />
        </div>
      </div>

      <div className="relative p-4">
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"} // Standard variants
              className={`cursor-pointer whitespace-nowrap transition-all duration-300 transform hover:scale-105`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {categoryFilteredArticles.map((article) => (
            <Card key={article.id} className="bg-card text-card-foreground border-border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"> {/* Themed Card */}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-card-foreground leading-tight"> {/* Themed Title */}
                    {article.title}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2 shrink-0"> {/* Standard secondary badge */}
                    {article.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">{article.summary}</p> {/* Themed summary */}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs"> {/* Standard outline badge */}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground text-xs"> {/* Themed text */}
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
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center"> {/* Themed icon bg */}
              <BookOpen className="h-12 w-12 text-primary-foreground" /> {/* Themed icon color */}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3> {/* Themed text */}
            <p className="text-muted-foreground">Try adjusting your search terms.</p> {/* Themed text */}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LibraryPage;
