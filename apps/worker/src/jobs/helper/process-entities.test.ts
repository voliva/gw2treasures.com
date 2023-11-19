import { randomUUID } from 'crypto';
import { UpsertInputData, processLocalizedEntities } from './process-entitites';
import { LocalizedObject } from './types';
import { Prisma, Revision } from '@gw2treasures/database';

function loadFromApi<T extends { id: number }>(entity: T) {
  return Promise.resolve(new Map<number, LocalizedObject<T>>([[entity.id, { de: entity, en: entity, es: entity, fr: entity }]]));
}

jest.mock('./revision-create', () => ({
  createRevision: (data: Prisma.RevisionUncheckedCreateInput) => Promise.resolve({ id: `test-${data.type}-${randomUUID()}` })
}));

type TestDbEntity = {
  id: number,
  current_de: Revision,
  current_en: Revision,
  current_es: Revision,
  current_fr: Revision,
  removedFromApi: boolean,
  version: number,
}

const revisionBase: Revision = { buildId: 1, createdAt: new Date(), data: JSON.stringify({ id: 1 }), description: 'Test', entity: 'test', id: 'test-revision', language: 'en', type: 'Import' };

const TestDbEntityBase: TestDbEntity = {
  id: 1,
  current_de: revisionBase,
  current_en: revisionBase,
  current_es: revisionBase,
  current_fr: revisionBase,
  removedFromApi: false,
  version: 1,
};

async function testProcessLocalizedEntities(dbEntity: Partial<TestDbEntity> | undefined, apiEntity: object | undefined): Promise<UpsertInputData<number, { testId_revisionId: { testId: string, revisionId: string }}> | undefined> {
  let upsertData = undefined;

  await processLocalizedEntities(
    { ids: [1] },
    'test',
    (testId, revisionId) => ({ testId_revisionId: { testId, revisionId }}),
    () => ({}), // migrate
    () => Promise.resolve(dbEntity ? [{ ...TestDbEntityBase, ...dbEntity }] : []), // get from db
    () => apiEntity ? loadFromApi({ id: 1, ...apiEntity }) : Promise.resolve(new Map()), // get from api
    (_, data) => {
      upsertData = data.create;
      return Promise.resolve();
    },
    1
  );

  return upsertData;
}

describe('process-entities', () => {
  test('new', async () => {
    const data = await testProcessLocalizedEntities(undefined, {});
    expect(data).toMatchObject({ id: 1, removedFromApi: false });
    expect(data?.currentId_en).toMatch(/^test-Added-/);
  });

  test('removed', async () => {
    const data = await testProcessLocalizedEntities({}, undefined);
    expect(data).toMatchObject({ removedFromApi: true });
    expect(data?.currentId_en).toMatch(/^test-Removed-/);
  });

  test('no changes', async () => {
    const data = await testProcessLocalizedEntities({}, {});
    expect(data).toBeUndefined();
  });

  test('updated', async () => {
    const data = await testProcessLocalizedEntities({}, { updated: true });
    expect(data).toBeDefined();
    expect(data?.currentId_en).toMatch(/^test-Update-/);
  });

  test('rediscovered', async () => {
    const data = await testProcessLocalizedEntities({ removedFromApi: true }, { updated: true });
    expect(data).toMatchObject({ removedFromApi: false });
    expect(data?.currentId_en).toMatch(/^test-Update-/);
  });

  test('migration', async () => {
    const data = await testProcessLocalizedEntities({ version: 0 }, {});
    expect(data).toMatchObject({ currentId_en: TestDbEntityBase.current_en.id, version: 1 });
  });
});
