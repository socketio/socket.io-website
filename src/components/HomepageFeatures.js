import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import Translate from '@docusaurus/Translate';

const FeatureList = [
  {
    title: <Translate>Performant</Translate>,
    description: (
      <Translate>
        In most cases, the connection will be established with WebSocket, providing a low-overhead communication channel between the server and the client.
      </Translate>
    ),
  },
  {
    title: <Translate>Reliable</Translate>,
    description: (
      <Translate>
        Rest assured! In case the WebSocket connection is not possible, it will fall back to HTTP long-polling. And if the connection is lost, the client will automatically try to reconnect.
      </Translate>
    ),
  },
  {
    title: <Translate>Scalable</Translate>,
    description: (
      <Translate>
        Scale to multiple servers and send events to all connected clients with ease.
      </Translate>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx(styles.feature, "text--center padding-horiz--md")}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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
