import { supabaseService } from './supabaseService';

export interface OfflineSyncItem {
  id: string;
  type: 'game_session' | 'assessment_session' | 'medicine_status' | 'routine_status' | 'patient_profile' | 'alert_create';
  payload: any;
  createdAt: string;
  retryCount: number;
}

const STORAGE_KEY = 'axiom_offline_sync_queue';

class OfflineSyncService {
  private isSyncing = false;

  public getQueue(): OfflineSyncItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: OfflineSyncItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.warn('[OfflineSync] Could not persist queue:', err);
    }
  }

  public enqueue(type: OfflineSyncItem['type'], payload: any): string {
    const queue = this.getQueue();
    const id = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const item: OfflineSyncItem = {
      id,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    queue.push(item);
    this.saveQueue(queue);
    console.log(`[OfflineSync] Enqueued offline operation: ${type} (${id})`);
    return id;
  }

  public getPendingCount(): number {
    return this.getQueue().length;
  }

  public async flush(): Promise<{ successCount: number; remainingCount: number }> {
    if (this.isSyncing) return { successCount: 0, remainingCount: this.getPendingCount() };
    if (!navigator.onLine) return { successCount: 0, remainingCount: this.getPendingCount() };

    const queue = this.getQueue();
    if (queue.length === 0) return { successCount: 0, remainingCount: 0 };

    this.isSyncing = true;
    let successCount = 0;
    const remainingQueue: OfflineSyncItem[] = [];

    for (const item of queue) {
      try {
        let synced = false;
        switch (item.type) {
          case 'game_session':
            synced = await supabaseService.recordGameSession(item.payload.patientId, item.payload.session);
            break;
          case 'assessment_session':
            synced = await supabaseService.saveAssessmentSession(item.payload.patientId, item.payload.result, item.payload.answers);
            break;
          case 'medicine_status':
            synced = await supabaseService.updateMedicineStatus(item.payload.medId, item.payload.isTaken, item.payload.takenAt);
            break;
          case 'routine_status':
            synced = await supabaseService.updateRoutineStatus(item.payload.itemId, item.payload.isCompleted, item.payload.completedAt);
            break;
          case 'patient_profile':
            synced = await supabaseService.syncPatientProfile(item.payload);
            break;
          case 'alert_create':
            synced = await supabaseService.createAlert(item.payload.patientId, item.payload.alert);
            break;
          default:
            synced = true;
        }

        if (synced) {
          successCount++;
        } else {
          item.retryCount += 1;
          remainingQueue.push(item);
        }
      } catch (err) {
        console.warn(`[OfflineSync] Failed to process sync item ${item.id}:`, err);
        item.retryCount += 1;
        remainingQueue.push(item);
      }
    }

    this.saveQueue(remainingQueue);
    this.isSyncing = false;
    return { successCount, remainingCount: remainingQueue.length };
  }
}

export const offlineSyncService = new OfflineSyncService();
export const getOfflineQueueLength = (): number => offlineSyncService.getPendingCount();
