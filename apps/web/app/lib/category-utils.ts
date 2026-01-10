import type { Category, Service } from '@homedock/types';
import { toGlow } from './color-utils';

export type CategoryTone = {
  accent: string;
  glow: string;
};

export type CategoryWithTone = Category & {
  tone: CategoryTone;
  services: Service[];
};

export const CATEGORY_TONES: CategoryTone[] = [
  { accent: '#7ef5d2', glow: 'rgba(126, 245, 210, 0.35)' },
  { accent: '#ffb86b', glow: 'rgba(255, 184, 107, 0.35)' },
  { accent: '#8ab6ff', glow: 'rgba(138, 182, 255, 0.35)' },
  { accent: '#ff8bcf', glow: 'rgba(255, 139, 207, 0.35)' }
];

export function withTones(categories: Category[]): CategoryWithTone[] {
  return categories.map((category, index) => {
    const fallback = CATEGORY_TONES[index % CATEGORY_TONES.length];
    const accent = category.color ?? fallback.accent;
    const glow = toGlow(accent) ?? fallback.glow;

    return {
      ...category,
      services: category.services ?? [],
      tone: { accent, glow }
    };
  });
}
