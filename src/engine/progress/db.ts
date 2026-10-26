import Dexie, { type EntityTable } from 'dexie';
import type { SkillStat } from './mastery';

export type Slot = 'dau' | 'mat' | 'co' | 'than' | 'tay';

export interface Profile {
  id: 'me';
  name: string;
  carrots: number;
  owned: string[];
  equipped: Partial<Record<Slot, string>>;
  createdAt: number;
}

export interface StationStat {
  stationId: string;
  bestStars: number;
  plays: number;
  lastAt: number;
}

export interface Artwork {
  id?: number;
  pictureId: string;
  fills: Record<string, string>;
  completedAt: number;
}

export interface AnswerLog {
  id?: number;
  skillId: string;
  result: 'first' | 'hint' | 'wrong';
  mode: 'practice' | 'exam';
  at: number;
}

/** Toàn bộ dữ liệu lưu trên máy của bé (IndexedDB), không gửi đi đâu. */
export const db = new Dexie('toan-rot') as Dexie & {
  profile: EntityTable<Profile, 'id'>;
  skills: EntityTable<SkillStat, 'skillId'>;
  stations: EntityTable<StationStat, 'stationId'>;
  artworks: EntityTable<Artwork, 'id'>;
  answers: EntityTable<AnswerLog, 'id'>;
};

db.version(1).stores({
  profile: 'id',
  skills: 'skillId',
  stations: 'stationId',
  artworks: '++id, pictureId, completedAt',
  answers: '++id, skillId, at',
});
