
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useLogTagSuggestions } from '@/hooks/useLogTagSuggestions';
import { useLogTagCategories } from '@/hooks/useLogTagCategories';
import { AddLogTagSuggestionForm } from './AddLogTagSuggestionForm';
import { AddCategoryForm } from './AddCategoryForm';
import { CategoryHeader } from './CategoryHeader';
import { CategoryTagList } from './CategoryTagList';

const LogTagSuggestionSettings = () => {
  const { t } = useTranslation();
  const { suggestions, loading, updateSuggestion, deleteSuggestion, refreshSuggestions } = useLogTagSuggestions();
  const { categories, loading: categoriesLoading, updateCategory, deleteCategory, refreshCategories } = useLogTagCategories();

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
    const groups: Record<string, typeof suggestions> = {};
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

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    try {
      await deleteCategory(id);
      refreshSuggestions();
    } catch (error) {
      console.error('Error deleting category:', error);
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

            return (
              <div key={categoryName} className="border rounded-lg bg-white shadow-sm">
                <Collapsible open={!isCollapsed} onOpenChange={() => toggleCategory(categoryName)}>
                  <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                    <CategoryHeader
                      category={categoryInfo}
                      tagCount={categoryTags.length}
                      isCollapsed={isCollapsed}
                      onUpdateCategory={updateCategory}
                      onDeleteCategory={handleDeleteCategory}
                    />
                  </div>
                  
                  <CollapsibleContent>
                    <CategoryTagList
                      tags={categoryTags}
                      categories={categories}
                      onUpdateSuggestion={updateSuggestion}
                      onDeleteSuggestion={deleteSuggestion}
                    />
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
