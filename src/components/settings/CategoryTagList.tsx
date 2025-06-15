
import { LogTagSuggestion } from '@/hooks/useLogTagSuggestions';
import { LogTagCategory } from '@/hooks/useLogTagCategories';
import { TagItem } from './TagItem';

interface CategoryTagListProps {
  tags: LogTagSuggestion[];
  categories: LogTagCategory[];
  onUpdateSuggestion: (id: string, name: string, color?: string, category?: string) => Promise<LogTagSuggestion>;
  onDeleteSuggestion: (id: string) => Promise<void>;
}

export const CategoryTagList = ({ 
  tags, 
  categories, 
  onUpdateSuggestion, 
  onDeleteSuggestion 
}: CategoryTagListProps) => {
  return (
    <div className="p-4">
      <ul className="space-y-3">
        {tags.map(suggestion => (
          <TagItem
            key={suggestion.id}
            suggestion={suggestion}
            categories={categories}
            onUpdateSuggestion={onUpdateSuggestion}
            onDeleteSuggestion={onDeleteSuggestion}
          />
        ))}
      </ul>
    </div>
  );
};
