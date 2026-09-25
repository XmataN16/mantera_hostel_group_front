export interface CachePayload<T> {
  data: T;
  expiry: number; // Timestamp истечения
}

export class StorageCache {
  // Получить данные из кэша
  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: CachePayload<T> = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.data;
    } catch {
      return null;
    }
  }

  // Сохранить данные в кэш
  static set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    const item: CachePayload<T> = {
      data,
      expiry: Date.now() + ttlMinutes * 60 * 1000
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Не удалось сохранить в localStorage', e);
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  // Очистить весь кэш приложения
  static clearAll(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}