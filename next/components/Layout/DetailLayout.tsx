import React, { FunctionComponent, ReactNode } from 'react';
import styles from './DetailLayout.module.css';
import TableOfContent from './TableOfContent';

interface DetailLayoutProps {
  title: string;
  icon?: string;
  breadcrumb?: ReactNode;
  children: ReactNode;
};

const DetailLayout: FunctionComponent<DetailLayoutProps> = ({ title, icon, breadcrumb, children }) => {
  return (
    <main className={styles.main}>
      <div className={styles.headline}>
        {icon && <img src={icon} alt="" className={styles.icon}/>}
        <h1 className={styles.title}>{title}</h1>
        {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}
      </div>
      <aside className={styles.infobox}>
        <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
      </aside>
      <aside className={styles.tableOfContent}>
        <TableOfContent items={[{ label: 'Used in crafting', id: '1' }, { label: 'Achievements', id: '2' }, { label: 'Similar', id: '3' }]} activeId="2"/>
      </aside>
      <div className={styles.content}>
        {children}
      </div>
    </main>
  );
};

export default DetailLayout;
