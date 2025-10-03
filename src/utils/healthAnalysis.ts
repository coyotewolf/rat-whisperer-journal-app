import type { LogEntry } from "@/types/logEntry";
import { differenceInDays, parseISO } from "date-fns";

export interface HealthAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  ratName?: string;
}

export const analyzeHealthAlerts = (logs: LogEntry[], t: (key: string, options?: any) => string): HealthAlert[] => {
  const alerts: HealthAlert[] = [];
  
  if (!logs || logs.length === 0) {
    return [{
      id: 'no-data',
      type: 'info',
      message: t('Start logging activities to track your rats health')
    }];
  }

  // Analyze weight trends
  const weightLogs = logs.filter(log => log.type === 'weight' && log.weight).slice(0, 10);
  const ratWeightMap = new Map<string, { weights: number[], dates: Date[], names: string[] }>();

  weightLogs.forEach(log => {
    log.ratIds?.forEach((ratId, index) => {
      if (!ratWeightMap.has(ratId)) {
        ratWeightMap.set(ratId, { weights: [], dates: [], names: [] });
      }
      const data = ratWeightMap.get(ratId)!;
      data.weights.push(log.weight!);
      data.dates.push(parseISO(log.timestamp));
      if (log.ratNames?.[index]) {
        data.names.push(log.ratNames[index]);
      }
    });
  });

  // Check for weight loss trends (3+ consecutive decreases)
  ratWeightMap.forEach((data, ratId) => {
    if (data.weights.length >= 3) {
      const recentWeights = data.weights.slice(0, 3);
      const isDecreasing = recentWeights.every((w, i) => i === 0 || w < recentWeights[i - 1]);
      
      if (isDecreasing) {
        const ratName = data.names[0] || t('Unknown rat');
        alerts.push({
          id: `weight-loss-${ratId}`,
          type: 'warning',
          message: t('{{ratName}} has been losing weight for 3 consecutive records', { ratName }),
          ratName
        });
      }
    }
  });

  // Analyze health status logs
  const recentHealthLogs = logs.filter(log => log.type === 'health').slice(0, 10);
  const unhealthyStatuses = ['sick', 'injured', 'critical'];
  
  recentHealthLogs.forEach(log => {
    if (log.status && unhealthyStatuses.includes(log.status.toLowerCase())) {
      const ratNames = log.ratNames?.join(', ') || t('Unknown rat');
      alerts.push({
        id: `health-${log.id}`,
        type: 'error',
        message: t('{{ratNames}} health status: {{status}}', { ratNames, status: log.status }),
        ratName: ratNames
      });
    }
  });

  // Analyze behavior patterns
  const recentBehaviorLogs = logs.filter(log => log.type === 'behavior').slice(0, 20);
  const aggressiveBehaviors = ['aggressive', 'fighting', 'biting', 'attack'];
  
  const ratBehaviorCount = new Map<string, { count: number, name: string }>();
  
  recentBehaviorLogs.forEach(log => {
    const hasAggressiveTags = log.hashtags?.some(tag => 
      aggressiveBehaviors.some(behavior => tag.toLowerCase().includes(behavior))
    );
    
    if (hasAggressiveTags) {
      log.ratIds?.forEach((ratId, index) => {
        const existing = ratBehaviorCount.get(ratId) || { count: 0, name: log.ratNames?.[index] || t('Unknown rat') };
        existing.count++;
        ratBehaviorCount.set(ratId, existing);
      });
    }
  });

  ratBehaviorCount.forEach((data, ratId) => {
    if (data.count >= 3) {
      alerts.push({
        id: `behavior-${ratId}`,
        type: 'error',
        message: t('{{ratName}} showed aggressive behavior {{count}} times recently', { ratName: data.name, count: data.count }),
        ratName: data.name
      });
    }
  });

  // Check for respiratory symptoms
  const respiratorySymptoms = ['sneezing', 'wheezing', 'labored breathing', 'nasal discharge'];
  recentHealthLogs.forEach(log => {
    const hasRespiratoryIssue = log.symptoms?.some(symptom =>
      respiratorySymptoms.some(resp => symptom.toLowerCase().includes(resp))
    );
    
    if (hasRespiratoryIssue) {
      const ratNames = log.ratNames?.join(', ') || t('Unknown rat');
      alerts.push({
        id: `respiratory-${log.id}`,
        type: 'warning',
        message: t('{{ratNames}} has respiratory symptoms, please monitor closely', { ratNames }),
        ratName: ratNames
      });
    }
  });

  // If no alerts, everything is good
  if (alerts.length === 0) {
    return [{
      id: 'all-good',
      type: 'success',
      message: t('Everything looks good! All your rats are healthy and happy.')
    }];
  }

  return alerts;
};