
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Check, X, Palette, ChevronDown, ChevronRight, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLogTagSuggestions, type LogTagSuggestion } from '@/hooks/useLogTagSuggestions';
import { useLogTagCategories } from '@/hooks/useLogTagCategories';
import { useToast } from '@/hooks/use-toast';
import { AddLogTagSuggestionForm } from './AddLogTagSuggestionForm';
import { AddCategoryForm } from './AddCategoryForm';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

const LogTagSuggestionSettings = () => {
  const { t } = useTranslation();
  const { suggestions, loading, updateSuggestion, deleteSuggestion, refreshSuggestions } = useLogTagSuggestions();
  const { categories, loading: categoriesLoading, updateCategory, deleteCategory, refreshCategories } = useLogTagCategories();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingColor, setEditingColor] = useState<string>('#6B7280');
  const [editingCategory, setEditingCategory] = useState<string>('general');

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');
  const [editingCategoryColor, setEditingCategoryColor] = useState<string>('#6B7280');

  const [showAddCategory, setShowAddCategory] = useState(false);
  
  // Manage collapsed state with localStorage
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('collapsedLogCategories');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const saveCollapsedState = (newCollapsed: Set<string>) => {
    setCollapsedCategories(newCollapsed);
    localStorage.setItem('collapsedLogCategories', JSON.stringify([...newCollapsed]));
  };

  const toggleCategory = (categoryName: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryName)) {
      newCollapsed.delete(categoryName);
    } else {
      newCollapsed.add(categoryName);
    }
    saveCollapsedState(newCollapsed);
  };

  // Group suggestions by category
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, LogTagSuggestion[]> = {};
    suggestions.forEach(suggestion => {
      const category = suggestion.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(suggestion);
    });
    return groups;
  }, [suggestions]);

  // Get category info
  const getCategoryInfo = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category || { 
      name: categoryName, 
      display_name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1), 
      color: '#6B7280',
      is_default: true,
      id: '',
      user_id: '',
      created_at: '',
      updated_at: ''
    };
  };

  const handleEditClick = (suggestion: LogTagSuggestion) => {
    setEditingId(suggestion.id);
    setEditingName(suggestion.name);
    setEditingColor(suggestion.color || '#6B7280');
    setEditingCategory(suggestion.category || 'general');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast({
        title: t("Error"),
        description: t("Tag name cannot be empty."),
        variant: "destructive",
      });
      return;
    }
    try {
      await updateSuggestion(id, editingName.trim(), editingColor, editingCategory);
      setEditingId(null);
      setEditingName('');
      setEditingColor('#6B7280');
      setEditingCategory('general');
    } catch (error) {
      console.error('Error updating tag suggestion:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#6B7280');
    setEditingCategory('general');
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (window.confirm(t("Are you sure you want to delete this tag suggestion?"))) {
      try {
        await deleteSuggestion(id);
      } catch (error) {
        console.error('Error deleting tag suggestion:', error);
      }
    }
  };

  const handleEditCategoryClick = (category: any) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.display_name);
    setEditingCategoryColor(category.color);
  };

  const handleSaveCategoryEdit = async (id: string) => {
    if (!editingCategoryName.trim()) {
      toast({
        title: t("Error"),
        description: t("Category name cannot be empty."),
        variant: "destructive",
      });
      return;
    }
    try {
      await updateCategory(id, editingCategoryName.trim(), editingCategoryColor);
      setEditingCategoryId(null);
      setEditingCategoryName('');
      setEditingCategoryColor('#6B7280');
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingCategoryColor('#6B7280');
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    if (window.confirm(t("Are you sure you want to delete this category? All tags in this category will also be deleted."))) {
      try {
        await deleteCategory(id);
        refreshSuggestions();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleAddCategoryComplete = () => {
    setShowAddCategory(false);
    refreshCategories();
  };

  if (loading || categoriesLoading) {
    return <div className="text-center py-8 text-gray-500">{t("Loading...")}</div>;
  }

  const availableCategories = categories.map(cat => cat.name);

  return (
    <div className="space-y-6">
      <AddLogTagSuggestionForm 
        onSuggestionAdded={refreshSuggestions} 
        availableCategories={availableCategories}
      />

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t("Categories")}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddCategory(!showAddCategory)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            {t("Add Category")}
          </Button>
        </div>

        {showAddCategory && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <AddCategoryForm
              onCategoryAdded={handleAddCategoryComplete}
              onCancel={() => setShowAddCategory(false)}
              showCancelButton={true}
            />
          </div>
        )}
      </div>

      {Object.keys(groupedSuggestions).length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t("No tag suggestions yet. Add one above.")}</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSuggestions).map(([categoryName, categoryTags]) => {
            const categoryInfo = getCategoryInfo(categoryName);
            const isCollapsed = collapsedCategories.has(categoryName);
            const isEditingCategory = editingCategoryId === categoryInfo.id;

            return (
              <div key={categoryName} className="border rounded-lg bg-white shadow-sm">
                <Collapsible open={!isCollapsed} onOpenChange={() => toggleCategory(categoryName)}>
                  <div className="p-4 border-b bg-gray-50 rounded-t-lg">
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
                              style={{ backgroundColor: categoryInfo.color }}
                            />
                            {isEditingCategory ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  value={editingCategoryName}
                                  onChange={(e) => setEditingCategoryName(e.target.value)}
                                  className="h-6 px-2 text-sm font-semibold"
                                  autoFocus
                                />
                                <Input
                                  type="color"
                                  value={editingCategoryColor}
                                  onChange={(e) => setEditingCategoryColor(e.target.value)}
                                  className="w-8 h-6 p-0 border-0 rounded"
                                />
                              </div>
                            ) : (
                              <span>{categoryInfo.display_name} ({categoryTags.length})</span>
                            )}
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      
                      <div className="flex items-center space-x-2">
                        {isEditingCategory ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleSaveCategoryEdit(categoryInfo.id)}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCancelCategoryEdit}>
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {!categoryInfo.is_default && (
                              <Button variant="ghost" size="icon" onClick={() => handleEditCategoryClick(categoryInfo)}>
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </Button>
                            )}
                            {!categoryInfo.is_default && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteCategory(categoryInfo.id, categoryName)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="p-4">
                      <ul className="space-y-3">
                        {categoryTags.map(suggestion => (
                          <li key={suggestion.id} className="flex justify-between items-center">
                            {editingId === suggestion.id ? (
                              <div className="flex items-center gap-2 flex-grow mr-2">
                                <div 
                                  className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: editingColor }}
                                >
                                  <Palette className="h-3 w-3 text-white opacity-75" />
                                </div>
                                <Input
                                  type="color"
                                  value={editingColor}
                                  onChange={(e) => setEditingColor(e.target.value)}
                                  className="w-8 h-8 p-0 border-0 rounded"
                                />
                                <Select value={editingCategory} onValueChange={setEditingCategory}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableCategories.map(cat => (
                                      <SelectItem key={cat} value={cat}>
                                        {getCategoryInfo(cat).display_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyPress={(e) => { if (e.key === 'Enter') handleSaveEdit(suggestion.id); }}
                                  className="text-sm flex-grow"
                                  autoFocus
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(suggestion.id)}>
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                                  <X className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: suggestion.color || '#6B7280' }}
                                  />
                                  <p className="font-medium text-gray-800">{suggestion.name}</p>
                                </div>
                                <div className="space-x-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(suggestion)}>
                                    <Pencil className="h-4 w-4 text-gray-500" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSuggestion(suggestion.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LogTagSuggestionSettings;
