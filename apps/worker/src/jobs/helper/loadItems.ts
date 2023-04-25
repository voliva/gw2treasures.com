import { Gw2Api } from 'gw2-api-types';
import { fetchApi } from './fetchApi';
import { groupEntitiesById } from './groupById';

export async function loadItems(ids: number[]) {
  const start = new Date();

  const [de, en, es, fr] = await Promise.all([
    fetchApi<Gw2Api.Item[]>(`/v2/items?lang=de&ids=${ids.join(',')}`).then(normalizeItems),
    fetchApi<Gw2Api.Item[]>(`/v2/items?lang=en&ids=${ids.join(',')}`).then(normalizeItems),
    fetchApi<Gw2Api.Item[]>(`/v2/items?lang=es&ids=${ids.join(',')}`).then(normalizeItems),
    fetchApi<Gw2Api.Item[]>(`/v2/items?lang=fr&ids=${ids.join(',')}`).then(normalizeItems),
  ]);

  console.log(`Fetched ${ids.length} items in ${(new Date().valueOf() - start.valueOf()) / 1000}s`);

  return groupEntitiesById(de, en, es, fr);
}

function normalizeItem(item: Gw2Api.Item): Gw2Api.Item {
  // stabilize random order of "upgrades_into"
  if(item.upgrades_into !== undefined) {
    item.upgrades_into = item.upgrades_into?.sort((a, b) => a.item_id - b.item_id);
  }
  // stabilize random order of "upgrades_from"
  if(item.upgrades_from !== undefined) {
    item.upgrades_from = item.upgrades_from?.sort((a, b) => a.item_id - b.item_id);
  }

  return item;
}

function normalizeItems(items: Gw2Api.Item[]) {
  return items.map(normalizeItem);
}
