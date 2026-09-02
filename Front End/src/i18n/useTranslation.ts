import { en } from './en';
import { as } from './as';
import { bn } from './bn';
import { hi } from './hi';
import { Language } from '../types';

export const translations = {
  en,
  as,
  bn,
  hi,
};

export type TranslationKey = typeof en;

export function getNestedTranslation(obj: any, path: string): string {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function formatString(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}
