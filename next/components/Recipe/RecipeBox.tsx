import { LocalizedEntity } from '@/lib/localizedName';
import { IngredientItem, Item, Recipe, Revision } from '@prisma/client';
import { FC } from 'react';
import Icon from '../../icons/Icon';
import { With, WithIcon } from '../../lib/with';
import { ItemLink } from '../Item/ItemLink';
import { Discipline, DisciplineIcon } from './DisciplineIcon';
import { Ingredients } from './Ingredients';
import styles from './RecipeBox.module.css';

interface RecipeBoxProps {
  recipe: Recipe & {
    currentRevision: Revision,
    itemIngredients: With<IngredientItem, { Item: WithIcon<Pick<Item, 'id' | 'rarity' | keyof LocalizedEntity>> }>[]
    unlockedByItems?: WithIcon<Pick<Item, 'id' | 'rarity' | keyof LocalizedEntity>>[]
  },
  outputItem: WithIcon<Pick<Item, 'id' | 'rarity' | keyof LocalizedEntity>> | null,
};

export const RecipeBox: FC<RecipeBoxProps> = ({ recipe, outputItem }) => {
  return (
    <div className={styles.box} data-recipe-id={recipe.id}>
      <div className={styles.title}>
        {outputItem !== null ? <ItemLink item={outputItem}/> : <span>Unknown Item</span>}
        {recipe.outputCount > 1 && ` ×${recipe.outputCount}`}
      </div>
      <div className={styles.info}>
        <span className={styles.disciplines}>
          {recipe.disciplines.map((discipline) => <DisciplineIcon key={discipline} discipline={discipline as Discipline}/>)}
        </span>
        <span className={styles.rating}>
          {recipe.rating}
        </span>
        <span className={styles.time}>
          {recipe.timeToCraftMs / 1000}s
        </span>
        <Icon icon="time"/>
      </div>
      <div className={styles.ingredients}>
        <Ingredients recipe={recipe}/>
      </div>
      <div className={styles.unlocks}>
        {recipe.flags.includes('AutoLearned')
          ? <span><Icon icon="unlock"/> Learned automatically</span>
          : recipe.flags.includes('LearnedFromItem')
            ? (recipe.unlockedByItems?.length
                ? recipe.unlockedByItems.map((unlock) => <ItemLink key={unlock.id} item={unlock} icon={16}/>)
                : <span><Icon icon="unlock"/> Learned from unknown item</span>)
            : <span><Icon icon="unlock"/> Discoverable</span>}
      </div>
    </div>
  );
};
