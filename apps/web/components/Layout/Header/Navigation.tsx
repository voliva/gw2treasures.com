import type { FC, ReactNode } from 'react';
import { LinkButton } from '@gw2treasures/ui/components/Form/Button';
import { Trans } from '../../I18n/Trans';
import styles from './Navigation.module.css';
import { HorizontalOverflowContainer } from '../HorizontalOverflowContainer';
import type { Language } from '@gw2treasures/database';
import { Composite, CompositeItem } from '@gw2treasures/ui/components/Focus/Composite';
import type { IconProp } from '@gw2treasures/ui';

interface NavigationProps {
  language: Language;
}

const Navigation: FC<NavigationProps> = ({ language }) => {
  return (
    <HorizontalOverflowContainer>
      <Composite render={<ul className={styles.navigation}/>}>
        <NavigationItem href="/item" icon="item"><Trans language={language} id="navigation.items"/></NavigationItem>
        <NavigationItem href="/achievement" icon="achievement"><Trans language={language} id="navigation.achievements"/></NavigationItem>
        <NavigationItem href="/wizards-vault" icon="wizards-vault"><Trans language={language} id="navigation.wizardsVault"/></NavigationItem>
        <NavigationItem href="/homestead/nodes" icon="homestead"><Trans language={language} id="navigation.homestead"/></NavigationItem>
        <NavigationItem href="/skin" icon="skin"><Trans language={language} id="navigation.skins"/></NavigationItem>
        {/* <NavigationItem href="/profession" icon="profession"><Trans language={language} id="navigation.professions"/></NavigationItem> */}
        {/* <NavigationItem href="/specialization" icon="specialization"><Trans language={language} id="navigation.specializations"/></NavigationItem> */}
        <NavigationItem href="/skill" icon="skill"><Trans language={language} id="navigation.skills"/></NavigationItem>
        <NavigationItem href="/fractals" icon="fractals"><Trans language={language} id="navigation.fractals"/><span className={styles.new}>new</span></NavigationItem>
        {/* <NavigationItem href="/event-timer" icon="event-boss">Event Timer<span className={styles.new}>new</span></NavigationItem> */}
        {/* <NavigationItem href="/mount" icon="mount"><Trans language={language} id="navigation.mounts"/></NavigationItem> */}
        {/* <NavigationItem href="/wvw" icon="wvw"><Trans language={language} id="navigation.wvw"/></NavigationItem> */}
        <NavigationItem href="/dev" icon="developer"><Trans language={language} id="navigation.developer"/></NavigationItem>
      </Composite>
    </HorizontalOverflowContainer>
  );
};

interface NavigationItemProps {
  children: ReactNode;
  href: string;
  icon: IconProp;
}

export const NavigationItem: FC<NavigationItemProps> = (props) => {
  return (
    <li className={styles.item}>
      <CompositeItem render={<LinkButton appearance="menu" {...props}/>}/>
    </li>
  );
};


export default Navigation;
