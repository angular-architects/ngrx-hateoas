import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Fast to Start With',
    Svg: require('@site/static/img/rocket-icon.svg').default,
    description: (
      <>
        ngrx-hateoas was designed from the ground up to be easily installed and
        used to get your state from backend into your frontend quickly.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    Svg: require('@site/static/img/focus-icon.svg').default,
    description: (
      <>
        ngrx-hateoas lets you focus on your state and does all the plumping and 
        infrastructe stuff for you. No need to write client services anymore.
      </>
    ),
  },
  {
    title: 'Powered by NgRX Signal Store',
    Svg: require('@site/static/img/ngrx-logo.svg').default,
    description: (
      <>
        ngrx-hateoas provides features for the famous ngrx signal store. It integrates
        smoothly in order to use it in combination with other features.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="card">
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
