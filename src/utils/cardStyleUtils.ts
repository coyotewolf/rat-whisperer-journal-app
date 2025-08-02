
export const getPriorityClasses = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-destructive/20 text-destructive-foreground border-destructive';
    case 'medium': return 'bg-secondary/20 text-secondary-foreground border-secondary';
    case 'low': return 'bg-accent/20 text-accent-foreground border-accent';
    default: return 'bg-muted/20 text-muted-foreground border-border';
  }
};

export const getTitlePriorityClasses = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-destructive';
    case 'medium': return 'text-primary';
    case 'low': return 'text-accent-foreground';
    default: return 'text-card-foreground';
  }
};

export const getRecentActivityCardColorClasses = (type: string | undefined) => {
  switch (type?.toLowerCase()) {
    case "behavior":
      return "border-[hsl(217,70%,65%)] bg-[hsl(217,70%,75%)] text-slate-800";
    case "health":
    case "health check":
      return "border-[hsl(262,60%,72%)] bg-[hsl(262,60%,82%)] text-slate-800";
    case "weight":
      return "border-[hsl(145,50%,65%)] bg-[hsl(145,50%,75%)] text-slate-800";
    case "environment":
      return "border-[hsl(30,70%,70%)] bg-[hsl(30,70%,80%)] text-slate-800";
    case "medication":
      return "border-[hsl(0,70%,70%)] bg-[hsl(0,70%,80%)] text-slate-800";
    case "feeding":
      return "border-[hsl(45,75%,70%)] bg-[hsl(45,75%,80%)] text-slate-800";
    default:
      return "bg-background/50 border-border text-card-foreground";
  }
};

export const getActivityStatusClasses = (status: string) => {
  if (status && status.includes(' g')) {
    return 'bg-primary text-primary-foreground border-primary';
  }
  
  switch (status?.toLowerCase()) {
    case 'excellent':
      return 'bg-green-500 text-white border-green-600';
    case 'good':
      return 'bg-lime-500 text-white border-lime-600';
    case 'fair':
      return 'bg-yellow-500 text-black border-yellow-600';
    case 'poor':
      return 'bg-orange-500 text-white border-orange-600';
    case 'sick':
      return 'bg-red-600 text-white border-red-700';
    case 'completed':
      return 'bg-primary text-primary-foreground border-primary';
    default:
      return 'bg-secondary text-secondary-foreground border-secondary';
  }
};

export const getHealthStatusEmoji = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'excellent':
      return '😊';
    case 'good':
      return '🙂';
    case 'fair':
      return '😐';
    case 'poor':
      return '😕';
    case 'sick':
      return '😷';
    default:
      return '';
  }
};
