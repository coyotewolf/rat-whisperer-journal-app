
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Pencil, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { LogTagCategory } from '@/hooks/useLogTagCategories';
import { useToast } from '@/hooks/use-toast';

interface CategoryHeaderProps {
  category: LogTagCategory;
  tagCount: number;
  isCollapsed: boolean;
  onUpdateCategory: (id: string, displayName: string, color?: string) => Promise<LogTagCategory>;
  onDeleteCategory: (id: string, categoryName: string) => Promise<void>;
}

export const CategoryHeader = ({ 
  category, 
  tagCount, 
  isCollapsed, 
  onUpdateCategory, 
  onDeleteCategory 
}: CategoryHeaderProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(category.display_name);
  const [editingColor, setEditingColor] = useState(category.color);

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      toast({
        title: t("Error"),
        description: t("Category name cannot be empty."),
        variant: "destructive",
      });
      return;
    }
    try {
      await onUpdateCategory(category.id, editingName.trim(), editingColor);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingName(category.display_name);
    setEditingColor(category.color);
  };

  const handleDeleteClick = () => {
    if (window.confirm(t("Are you sure you want to delete this category? All tags in this category will also be deleted."))) {
      onDeleteCategory(category.id, category.name);
    }
  };

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
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-6 px-2 text-sm font-semibold"
                  autoFocus
                />
                <Input
                  type="color"
                  value={editingColor}
                  onChange={(e) => setEditingColor(e.target.value)}
                  className="w-8 h-6 p-0 border-0 rounded"
                />
              </div>
            ) : (
              <span>{category.display_name} ({tagCount})</span>
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </>
        ) : (
          <>
            {!category.is_default && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 text-gray-500" />
              </Button>
            )}
            {!category.is_default && (
              <Button variant="ghost" size="icon" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
