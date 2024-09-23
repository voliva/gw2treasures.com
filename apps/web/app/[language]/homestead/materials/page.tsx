import { Trans } from '@/components/I18n/Trans';
import { ItemLink } from '@/components/Item/ItemLink';
import { globalColumnRenderer as itemTableColumn } from '@/components/ItemTable/columns';
import { Description } from '@/components/Layout/Description';
import { PageView } from '@/components/PageView/PageView';
import { ColumnSelect } from '@/components/Table/ColumnSelect';
import { cache } from '@/lib/cache';
import { linkProperties } from '@/lib/linkProperties';
import { db } from '@/lib/prisma';
import { groupById } from '@gw2treasures/helper/group-by';
import { Headline } from '@gw2treasures/ui/components/Headline/Headline';
import { createDataTable, type DataTable } from '@gw2treasures/ui/components/Table/DataTable';
import type { FC } from 'react';
import {
  fiber,
  FIBER_ID,
  metal,
  METAL_ID,
  wood,
  WOOD_ID,
  type ConversionRate,
  type RefinedSources,
} from './data';
import { Switch } from '@gw2treasures/ui/components/Form/Switch';
import type { PageProps } from '@/lib/next';
import { UnknownItem } from '@/components/Item/UnknownItem';
import type { Metadata } from 'next';
import { getAlternateUrls } from '@/lib/url';
import { translate } from '@/lib/translate';

const getItems = cache(
  async (ids: number[]) => {
    const items = await db.item.findMany({
      where: { id: { in: ids }},
      select: {
        ...linkProperties,
        tpTradeable: true,
        tpCheckedAt: true,
        buyPrice: true,
        sellPrice: true,
      },
    });

    return Object.fromEntries(groupById(items).entries());
  },
  ['homestead-refined-mats'],
  { revalidate: 60 * 5 }
);

export default async function RefinedMaterialsPage({ searchParams: { efficiency: rawEfficiency }}: PageProps) {
  // get items from db
  const allItemIds = [
    ...Object.keys(wood),
    ...Object.keys(metal),
    ...Object.keys(fiber),
    FIBER_ID,
    WOOD_ID,
    METAL_ID,
  ].map(Number);
  const items = await getItems(allItemIds);

  // parse efficiency query param
  const efficiency = Math.max(1, Math.min(3, Number(rawEfficiency) || 3));

  // map sources to item from db
  const getRefinedData = (source: RefinedSources, outputItemId: number) => {
    return {
      output: items[outputItemId],
      sources: Object.entries(source).map<RefinedDataSource>(([sourceId, costs]) => ({
        id: Number(sourceId),
        item: items[sourceId],
        rate: costs[efficiency - 1],
      })),
    };
  };

  // create data tables
  const metalData = getRefinedData(metal, METAL_ID);
  const MetalTable = createDataTable(metalData.sources, ({ id }) => id);

  const woodData = getRefinedData(wood, WOOD_ID);
  const WoodTable = createDataTable(woodData.sources, ({ id }) => id);

  const fiberData = getRefinedData(fiber, FIBER_ID);
  const FiberTable = createDataTable(fiberData.sources, ({ id }) => id);

  return (
    <>
      <Description>
        <Trans id="homestead.materials.description"/>
      </Description>
      <Description>
        <Trans id="homestead.materials.help"/>
      </Description>

      <label style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Trans id="homestead.materials.efficiency"/>:
        <Switch>
          <Switch.Control type="link" replace active={efficiency === 1} href="/homestead/materials?efficiency=1">1</Switch.Control>
          <Switch.Control type="link" replace active={efficiency === 2} href="/homestead/materials?efficiency=2">2</Switch.Control>
          <Switch.Control type="link" replace active={efficiency === 3} href="/homestead/materials">3</Switch.Control>
        </Switch>
      </label>

      <Headline id="refinedMetal" actions={<ColumnSelect table={MetalTable}/>}>
        <ItemLink item={metalData.output}/>
      </Headline>
      <RefinedDataTable table={MetalTable}/>

      <Headline id="refinedWood" actions={<ColumnSelect table={WoodTable}/>}>
        <ItemLink item={woodData.output}/>
      </Headline>
      <RefinedDataTable table={WoodTable}/>

      <Headline id="refinedWood" actions={<ColumnSelect table={FiberTable}/>}>
        <ItemLink item={fiberData.output}/>
      </Headline>
      <RefinedDataTable table={FiberTable}/>

      <PageView page="homestead/refinedMaterials"/>
    </>
  );
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: translate('homestead.materials', params.language),
    // make sure the efficiency query parameter is not part of the canonical URL, so only the default gets indexed by search engines
    alternates: getAlternateUrls('/homestead/materials')
  };
}

type RefinedDataSource = {
  id: number;
  item?: Awaited<ReturnType<typeof getItems>>[string];
  rate: ConversionRate;
};

const RefinedDataTable: FC<{ table: DataTable<RefinedDataSource> }> = ({
  table,
}) => (
  <table.Table>
    <table.Column id="id" title="Id" small hidden>
      {({ id }) => id}
    </table.Column>
    <table.Column id="source" title="Source">
      {({ item, id }) => item ? <ItemLink item={item}/> : <UnknownItem id={id}/>}
    </table.Column>
    <table.Column
      id="amountRequired"
      title="Amount Required"
      sortBy={({ rate }) => rate.required}
      align="right"
      hidden
    >
      {({ rate }) => rate.required}
    </table.Column>
    <table.Column
      id="amountProduced"
      title="Amount Produced"
      sortBy={({ rate }) => rate.produced}
      align="right"
    >
      {({ rate }) => rate.produced}
    </table.Column>
    <table.Column
      id="buyPrice"
      title="Buy Price"
      sortBy={({ item, rate }) => getCostPerUnit(item?.buyPrice, rate)}
      align="right"
    >
      {({ item, rate }) => item && itemTableColumn.buyPrice({
        ...item,
        buyPrice: getCostPerUnit(item.buyPrice, rate)
      }, {})}
    </table.Column>
    <table.Column
      id="sellPrice"
      title="Sell Price"
      sortBy={({ item, rate }) => getCostPerUnit(item?.sellPrice, rate)}
      align="right"
      hidden
    >
      {({ item, rate }) => item && itemTableColumn.sellPrice({
        ...item,
        sellPrice: getCostPerUnit(item.sellPrice, rate)
      }, {})}
    </table.Column>
  </table.Table>
);

const getCostPerUnit = (price: number | null | undefined, rate: ConversionRate) => price != null
  ? Math.round(price * rate.required / rate.produced)
  : null;
