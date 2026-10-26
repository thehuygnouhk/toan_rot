import Dexie, { type DexieOptions, type EntityTable } from 'dexie';
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

type Db = Dexie & {
  profile: EntityTable<Profile, 'id'>;
  skills: EntityTable<SkillStat, 'skillId'>;
  stations: EntityTable<StationStat, 'stationId'>;
  artworks: EntityTable<Artwork, 'id'>;
  answers: EntityTable<AnswerLog, 'id'>;
};

function createDb(options?: DexieOptions): Db {
  const d = new Dexie('toan-rot', options) as Db;
  d.version(1).stores({
    profile: 'id',
    skills: 'skillId',
    stations: 'stationId',
    artworks: '++id, pictureId, completedAt',
    answers: '++id, skillId, at',
  });
  return d;
}

/** Toàn bộ dữ liệu lưu trên máy của bé (IndexedDB), không gửi đi đâu. */
export let db = createDb();

/** false khi trình duyệt chặn lưu trữ (chế độ ẩn danh…): app vẫn chạy nhưng không nhớ tiến độ. */
export let persistent = true;

export async function openDb(): Promise<void> {
  try {
    await db.open();
  } catch {
    const fake = await import('fake-indexeddb');
    db = createDb({ indexedDB: fake.indexedDB, IDBKeyRange: fake.IDBKeyRange });
    persistent = false;
    await db.open();
  }
}
