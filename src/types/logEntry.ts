
export interface LogEntry {
  id: string;
  type: string;
  ratIds?: string[];
  ratNames?: string[];
  behavior?: string;
  weight?: number;
  temperature?: number;
  humidity?: number;
  timestamp: string;
  updated_at: string;
  notes: string;
  hashtags?: string[];
  symptoms?: string[];
  medication?: string;
  dose?: string;
  food?: string;
  amount?: string;
  status?: string; // Added for health status, etc.
}

export interface LogEntryContent {
  behavior?: string;
  weight?: number;
  temperature?: number;
  humidity?: number;
  notes?: string;
  tags?: string[];
  symptoms?: string[];
  medication?: string;
  dose?: string;
  food?: string;
  amount?: string;
  status?: string; // Added for health status, etc.
}
