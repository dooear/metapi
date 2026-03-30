import { eq } from 'drizzle-orm';
import { db } from './index.js';

type TableWithNumericId = {
  id: unknown;
  $inferSelect: unknown;
};

export async function insertAndFetchById<TTable extends TableWithNumericId>(
  table: TTable,
  values: unknown,
  txDb: any = db,
): Promise<TTable['$inferSelect']> {
  const inserted = await txDb.insert(table as any).values(values as any).run();
  const insertedId = Number(inserted.lastInsertRowid || 0);
  if (insertedId <= 0) {
    throw new Error('Insert completed without returning a numeric id.');
  }

  const row = await txDb.select()
    .from(table as any)
    .where(eq((table as any).id, insertedId))
    .get();
  if (!row) {
    throw new Error(`Inserted row ${insertedId} could not be loaded.`);
  }

  return row as TTable['$inferSelect'];
}
