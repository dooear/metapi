import { describe, expect, it, vi } from 'vitest';
import { insertAndFetchById } from './insertAndFetchById.js';

describe('insertAndFetchById', () => {
  it('reloads the inserted row by lastInsertRowid', async () => {
    const get = vi.fn(async () => ({ id: 7, name: 'demo' }));
    const where = vi.fn(() => ({ get }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    const run = vi.fn(async () => ({ changes: 1, lastInsertRowid: 7 }));
    const values = vi.fn(() => ({ run }));
    const insert = vi.fn(() => ({ values }));

    const txDb = { insert, select };
    const table = { id: Symbol('id') } as any;

    const row = await insertAndFetchById(table, { name: 'demo' }, txDb);

    expect(insert).toHaveBeenCalledWith(table);
    expect(values).toHaveBeenCalledWith({ name: 'demo' });
    expect(where).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(row).toEqual({ id: 7, name: 'demo' });
  });

  it('throws when the insert result does not expose a numeric id', async () => {
    const run = vi.fn(async () => ({ changes: 1, lastInsertRowid: 0 }));
    const values = vi.fn(() => ({ run }));
    const insert = vi.fn(() => ({ values }));
    const select = vi.fn();

    await expect(insertAndFetchById({ id: Symbol('id') } as any, { name: 'demo' }, {
      insert,
      select,
    })).rejects.toThrow(/numeric id/i);
    expect(select).not.toHaveBeenCalled();
  });

  it('throws when the inserted row cannot be reloaded', async () => {
    const get = vi.fn(async () => undefined);
    const where = vi.fn(() => ({ get }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    const run = vi.fn(async () => ({ changes: 1, lastInsertRowid: 9 }));
    const values = vi.fn(() => ({ run }));
    const insert = vi.fn(() => ({ values }));

    await expect(insertAndFetchById({ id: Symbol('id') } as any, { name: 'demo' }, {
      insert,
      select,
    })).rejects.toThrow(/could not be loaded/i);
  });
});
