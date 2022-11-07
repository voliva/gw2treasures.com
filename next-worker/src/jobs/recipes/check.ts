import { Job } from '../job';
import fetch from 'node-fetch';
import { queueJobForIds } from '../helper/queueJobsForIds';

export const RecipesCheck: Job = {
  run: async (db, data) => {
    // skip if any follow up jobs are still queued
    const queuedJobs = await db.job.count({ where: { type: { in: ['recipes.new', 'recipes.removed', 'recipes.rediscovered'] }, state: { in: ['Queued', 'Running'] } } })

    if(queuedJobs > 0) {
      return 'Waiting for pending follow up jobs';
    }

    // get recipe ids from the API
    const ids: number[] = await fetch('https://api.guildwars2.com/v2/recipes').then((r) => r.json());

    // get known ids from the DB
    const knownIds = await db.recipe.findMany({ select: { id: true } }).then((recipes) => recipes.map(({ id }) => id));
    const knownRemovedIds = await db.recipe.findMany({ select: { id: true }, where: { removedFromApi: true } }).then((recipes) => recipes.map(({ id }) => id));

    // Build new ids
    const newIds = ids.filter((id) => !knownIds.includes(id));
    const removedIds = knownIds.filter((id) => !ids.includes(id) && !knownRemovedIds.includes(id));
    const rediscoveredIds = knownRemovedIds.filter((id) => ids.includes(id));

    // queue follow up jobs
    await queueJobForIds(db, 'recipes.new', newIds);
    // await queueJobForIds(db, 'recipes.removed', removedIds);
    // await queueJobForIds(db, 'recipes.rediscovered', rediscoveredIds);

    return `${newIds.length} added, ${removedIds.length} removed, ${rediscoveredIds.length} rediscovered`;
  }
}
