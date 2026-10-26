import { describe, expect, it } from 'vitest';

describe('khi trình duyệt chặn IndexedDB', () => {
  it('vẫn mở được kho dữ liệu tạm trong bộ nhớ', async () => {
    // Môi trường test không có IndexedDB thật — giống trình duyệt đang chặn lưu trữ
    expect(globalThis.indexedDB).toBeUndefined();
    const mod = await import('./db');
    await mod.openDb();
    expect(mod.persistent).toBe(false);
    await mod.db.profile.put({ id: 'me', name: 'Na', carrots: 1, owned: [], equipped: {}, createdAt: 0 });
    expect((await mod.db.profile.get('me'))?.name).toBe('Na');
  });
});
