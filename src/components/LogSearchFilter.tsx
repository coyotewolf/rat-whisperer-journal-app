
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface LogSearchFilterProps {
  onSearch: (query: string) => void;
  onHashtagFilter: (hashtags: string[]) => void;
  availableHashtags?: string[];
}

const LogSearchFilter = ({ onSearch, onHashtagFilter, availableHashtags = [] }: LogSearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleHashtagToggle = (hashtag: string) => {
    const newSelectedHashtags = selectedHashtags.includes(hashtag)
      ? selectedHashtags.filter(tag => tag !== hashtag)
      : [...selectedHashtags, hashtag];
    
    setSelectedHashtags(newSelectedHashtags);
    onHashtagFilter(newSelectedHashtags);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedHashtags([]);
    onSearch("");
    onHashtagFilter([]);
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 backdrop-blur-md bg-white/10 border-white/20 text-white placeholder:text-gray-300"
        />
      </div>
      
      {availableHashtags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-purple-100/80">Filter by tags:</p>
          <div className="flex flex-wrap gap-2">
            {availableHashtags.map((hashtag) => (
              <Badge
                key={hashtag}
                variant="outline"
                className={`cursor-pointer transition-all border-white/20 ${
                  selectedHashtags.includes(hashtag)
                    ? "bg-orange-500 text-white border-orange-300"
                    : "text-white hover:bg-white/20"
                }`}
                onClick={() => handleHashtagToggle(hashtag)}
              >
                #{hashtag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {(searchQuery || selectedHashtags.length > 0) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-100/80">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              Search: {searchQuery}
            </Badge>
          )}
          {selectedHashtags.map((hashtag) => (
            <Badge key={hashtag} variant="secondary" className="bg-orange-500/20 text-orange-100">
              #{hashtag}
            </Badge>
          ))}
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-purple-100/80 hover:text-white flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default LogSearchFilter;
