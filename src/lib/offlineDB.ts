import { openDB, type DBSchema } from 'idb';
import type { LogEntry } from '@/types/logEntry';
import type { Task } from '@/hooks/useTasks';

interface AppDB extends DBSchema {
  logs: {
    key: string;
    value: LogEntry;
  };
  tasks: {
    key: string;
    value: Task;
  };
  outboxLogs: {
    key: number;
    value: Omit<LogEntry, 'id'> & { timestamp: string; updated_at: string };
  };
  outboxTasks: {
    key: number;
    value: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { created_at: string; updated_at: string };
  };
  outboxLogUpdates: {
    key: string;
    value: { id: string; updates: Partial<LogEntry>; updated_at: string };
  };
  outboxTaskUpdates: {
    key: string;
    value: { id: string; updates: Partial<Task>; updated_at: string };
  };
}

const DB_NAME = 'app-db';
const DB_VERSION = 2;

const dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('logs')) db.createObjectStore('logs', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('outboxLogs')) db.createObjectStore('outboxLogs', { keyPath: 'timestamp' });
    if (!db.objectStoreNames.contains('outboxTasks')) db.createObjectStore('outboxTasks', { keyPath: 'created_at' });
    if (!db.objectStoreNames.contains('outboxLogUpdates')) db.createObjectStore('outboxLogUpdates', { keyPath: 'updated_at' });
    if (!db.objectStoreNames.contains('outboxTaskUpdates')) db.createObjectStore('outboxTaskUpdates', { keyPath: 'updated_at' });
  }
});

export const offlineDB = () => dbPromise;

export async function cacheLogs(logs: LogEntry[]) {
  const db = await dbPromise;
  const tx = db.transaction('logs', 'readwrite');
  await tx.store.clear();
  for (const log of logs) {
    await tx.store.put(log);
  }
  await tx.done;
}

export async function getCachedLogs() {
  const db = await dbPromise;
  return await db.getAll('logs');
}

export async function enqueueLog(log: Omit<LogEntry, 'id'> & { timestamp: string; updated_at: string }) {
  const db = await dbPromise;
  await db.put('outboxLogs', log);
}

export async function getOutboxLogs() {
  const db = await dbPromise;
  return await db.getAll('outboxLogs');
}

export async function clearOutboxLogs() {
  const db = await dbPromise;
  const tx = db.transaction('outboxLogs', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function cacheTasks(tasks: Task[]) {
  const db = await dbPromise;
  const tx = db.transaction('tasks', 'readwrite');
  await tx.store.clear();
  for (const task of tasks) {
    await tx.store.put(task);
  }
  await tx.done;
}

export async function getCachedTasks() {
  const db = await dbPromise;
  return await db.getAll('tasks');
}

export async function enqueueTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { created_at: string; updated_at: string }) {
  const db = await dbPromise;
  await db.put('outboxTasks', task);
}

export async function getOutboxTasks() {
  const db = await dbPromise;
  return await db.getAll('outboxTasks');
}

export async function clearOutboxTasks() {
  const db = await dbPromise;
  const tx = db.transaction('outboxTasks', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function enqueueLogUpdate(update: { id: string; updates: Partial<LogEntry>; updated_at: string }) {
  const db = await dbPromise;
  await db.put('outboxLogUpdates', update);
}

export async function getOutboxLogUpdates() {
  const db = await dbPromise;
  return await db.getAll('outboxLogUpdates');
}

export async function clearOutboxLogUpdates() {
  const db = await dbPromise;
  const tx = db.transaction('outboxLogUpdates', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

export async function enqueueTaskUpdate(update: { id: string; updates: Partial<Task>; updated_at: string }) {
  const db = await dbPromise;
  await db.put('outboxTaskUpdates', update);
}

export async function getOutboxTaskUpdates() {
  const db = await dbPromise;
  return await db.getAll('outboxTaskUpdates');
}

export async function clearOutboxTaskUpdates() {
  const db = await dbPromise;
  const tx = db.transaction('outboxTaskUpdates', 'readwrite');
  await tx.store.clear();
  await tx.done;
}
