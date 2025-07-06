
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { LogTagCategory } from '@/hooks/useLogTagCategories';

interface CategoryHeaderProps {
  category: LogTagCategory;
  tagCount: number;
  isCollapsed: boolean;
  onUpdateCategory?: (id: string, displayName: string, color?: string) => Promise<LogTagCategory>;
  onDeleteCategory?: (id: string, categoryName: string) => Promise<void>;
}

export const CategoryHeader = ({ 
  category, 
  tagCount, 
  isCollapsed
}: CategoryHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="p-0 h-auto font-semibold text-left">
          <div className="flex items-center gap-2">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: category.color }}
            />
            <span>{category.display_name} ({tagCount})</span>
          </div>
        </Button>
      </CollapsibleTrigger>
    </div>
  );
};
