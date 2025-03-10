/* eslint-disable @next/next/no-img-element */
import { Trans } from '@/components/I18n/Trans';
import { createDataTable } from '@gw2treasures/ui/components/Table/DataTable';
import { db } from '@/lib/prisma';
import { ColumnSelect } from '@/components/Table/ColumnSelect';
import { EntityIcon } from '@/components/Entity/EntityIcon';
import { FlexRow } from '@gw2treasures/ui/components/Layout/FlexRow';
import { cache } from '@/lib/cache';
import { Gw2AccountBodyCells, Gw2AccountHeaderCells } from '@/components/Gw2Api/Gw2AccountTableCells';
import { AccountHomesteadDecorationCell, DecorationRowFilter, DecorationTableFilter, DecorationTableProvider, requiredScopes } from '../homestead.client';
import { PageView } from '@/components/PageView/PageView';
import { EntityIconMissing } from '@/components/Entity/EntityIconMissing';
import { FormatNumber } from '@/components/Format/FormatNumber';
import { localizedName } from '@/lib/localizedName';
import { Description } from '@/components/Layout/Description';
import type { PageProps } from '@/lib/next';

const getDecorations = cache(
  () => db.homesteadDecoration.findMany({
    include: {
      icon: true,
      categories: true,
    }
  }),
  ['homestead-decorations'], { revalidate: 60 }
);

const getDecorationCategories = cache(
  () => db.homesteadDecorationCategory.findMany(),
  ['homestead-decoration-categories'], { revalidate: 60 }
);

export default async function HomesteadDecorationsPage({ params: { language }}: PageProps) {
  const [decorations, decorationCategories] = await Promise.all([
    getDecorations(),
    getDecorationCategories(),
  ]);

  const Decorations = createDataTable(decorations, ({ id }) => id);

  const decorationFilterDings = decorationCategories.map((category) => ({
    id: category.id,
    name: localizedName(category, language),
    decorationIndexes: decorations.map(({ categoryIds }, index) => [categoryIds, index] as const)
      .filter(([ categoryIds ]) => categoryIds.includes(category.id))
      .map(([, index]) => index)
  }));

  return (
    <>
      <DecorationTableProvider categories={decorationFilterDings}>
        <Description actions={[<DecorationTableFilter key="filter" totalCount={decorations.length}/>, <ColumnSelect key="columns" table={Decorations}/>]}>
          <Trans id="homestead.decorations.description"/>
        </Description>

        <Decorations.Table rowFilter={DecorationRowFilter}>
          <Decorations.Column id="id" title="Id" align="right" small hidden>{({ id }) => id}</Decorations.Column>
          <Decorations.Column id="name" title="Decoration" sortBy={(decoration) => decoration[`name_${language}`]}>
            {({ icon, ...decoration }) => (
              <FlexRow>{icon ? <EntityIcon icon={icon} size={32}/> : <EntityIconMissing size={32}/>} {decoration[`name_${language}`]}</FlexRow>
            )}
          </Decorations.Column>
          <Decorations.Column id="categories" title="Categories">
            {({ categories }) => categories.map((category) => localizedName(category, language)).join(', ')}
          </Decorations.Column>
          <Decorations.Column id="maxCount" title="Max Count" sortBy="maxCount" align="right">{({ maxCount }) => <FormatNumber value={maxCount}/>}</Decorations.Column>
          <Decorations.DynamicColumns headers={<Gw2AccountHeaderCells requiredScopes={requiredScopes} small/>}>
            {({ id }) => <Gw2AccountBodyCells requiredScopes={requiredScopes}><AccountHomesteadDecorationCell decorationId={id} accountId={undefined as never}/></Gw2AccountBodyCells>}
          </Decorations.DynamicColumns>
        </Decorations.Table>
      </DecorationTableProvider>

      <PageView page="homestead/decorations"/>
    </>
  );
}

export const metadata = {
  title: 'Homestead Decorations'
};
