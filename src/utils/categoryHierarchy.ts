
export interface CategoryHierarchy {
  priority: 'critical' | 'important' | 'standard';
  primaryContent: string[];
  secondaryContent: string[];
  visualWeight: {
    titleSize: string;
    valueSize: string;
    statusSize: string;
    timeSize: string;
  };
  spacing: {
    internal: string;
    external: string;
  };
}

export const categoryHierarchies: Record<string, CategoryHierarchy> = {
  health: {
    priority: 'critical',
    primaryContent: ['status', 'symptoms'],
    secondaryContent: ['notes', 'time'],
    visualWeight: {
      titleSize: 'text-lg font-bold',
      valueSize: 'text-xl font-semibold',
      statusSize: 'text-base font-medium',
      timeSize: 'text-sm'
    },
    spacing: {
      internal: 'space-y-3',
      external: 'mb-4'
    }
  },
  weight: {
    priority: 'critical',
    primaryContent: ['weight', 'trend'],
    secondaryContent: ['notes', 'time'],
    visualWeight: {
      titleSize: 'text-lg font-bold',
      valueSize: 'text-2xl font-bold',
      statusSize: 'text-sm font-medium',
      timeSize: 'text-sm'
    },
    spacing: {
      internal: 'space-y-2',
      external: 'mb-4'
    }
  },
  medication: {
    priority: 'critical',
    primaryContent: ['medication', 'dose'],
    secondaryContent: ['notes', 'time'],
    visualWeight: {
      titleSize: 'text-lg font-bold',
      valueSize: 'text-lg font-semibold',
      statusSize: 'text-base font-medium',
      timeSize: 'text-sm'
    },
    spacing: {
      internal: 'space-y-2',
      external: 'mb-4'
    }
  },
  behavior: {
    priority: 'important',
    primaryContent: ['behaviorTags', 'behavior'],
    secondaryContent: ['notes', 'time'],
    visualWeight: {
      titleSize: 'text-base font-semibold',
      valueSize: 'text-base font-medium',
      statusSize: 'text-sm font-medium',
      timeSize: 'text-sm'
    },
    spacing: {
      internal: 'space-y-2',
      external: 'mb-3'
    }
  },
  feeding: {
    priority: 'important',
    primaryContent: ['food', 'amount'],
    secondaryContent: ['notes', 'time'],
    visualWeight: {
      titleSize: 'text-base font-semibold',
      valueSize: 'text-base font-medium',
      statusSize: 'text-sm font-medium',
      timeSize: 'text-sm'
    },
    spacing: {
      internal: 'space-y-2',
      external: 'mb-3'
    }
  },
  environment: {
    priority: 'standard',
    primaryContent: ['temperature', 'humidity'],
    secondaryContent: ['notes', 'time'],
    visualWeight: {
      titleSize: 'text-base font-medium',
      valueSize: 'text-base font-medium',
      statusSize: 'text-sm font-normal',
      timeSize: 'text-xs'
    },
    spacing: {
      internal: 'space-y-1',
      external: 'mb-2'
    }
  }
};

export const getCategoryHierarchy = (type: string): CategoryHierarchy => {
  return categoryHierarchies[type] || categoryHierarchies.behavior;
};

export const getPriorityClasses = (priority: 'critical' | 'important' | 'standard') => {
  switch (priority) {
    case 'critical':
      return 'border-l-4 border-l-red-500 shadow-lg';
    case 'important':
      return 'border-l-3 border-l-orange-400 shadow-md';
    case 'standard':
      return 'border-l-2 border-l-blue-300 shadow-sm';
  }
};
