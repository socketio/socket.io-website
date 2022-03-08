import styles from './HomepageExample.module.css';
import React from 'react';
import server from '../../static/images/homepage-server.png';
import client from '../../static/images/homepage-client.png';
import Translate from '@docusaurus/Translate';
import clsx from "clsx";

export default function HomepageExample() {
  return (
    <section className={ clsx("container", styles.example) }>
      <h3 className="text--center">
        <Translate>Basic example</Translate>
      </h3>

      <div className={ styles.windows }>
        <img className={ styles.window } src={ server } alt="Browser window with server example" />
        <img className={ styles.window } src={ client } alt="Browser window with client example" />
      </div>

      <p className="text--center">
        <Translate>Run this example on</Translate>
        <span> </span>
        <a href="https://replit.com/@socketio/socketio-minimal-example">Replit</a>
        <span> / </span>
        <a href="https://stackblitz.com/edit/socketio-base?file=index.js">StackBlitz</a>
        <span> / </span>
        <a href="https://codesandbox.io/s/socket-io-minimal-example-k3h2l">CodeSandbox</a>
      </p>

    </section>
  )
}
