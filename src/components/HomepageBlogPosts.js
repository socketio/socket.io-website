import React from "react";
import styles from "./HomepageBlogPosts.module.css";
import Translate from '@docusaurus/Translate';
import Link from "@docusaurus/Link";

// this list must be kept manually up-to-date
export default function HomepageBlogPosts() {
  return (
    <div className={styles.list}>
      <h3>
        <Translate>Latest blog posts</Translate>
      </h3>
      <div>
        <ul>
          <li className={ styles.item }>
            July 12, 2024 - <Link to="/blog/monorepo/">Socket.IO monorepo</Link>
          </li>
          <li className={ styles.item }>
            March 29, 2024 - <Link to="/blog/three-new-adapters/">Three new adapters</Link>
          </li>
          <li className={ styles.item }>
            January 12, 2024 - <Link to="/blog/chat-platform/">Chat platform</Link>
          </li>
        </ul>
        Blog feed: <Link to="blog/rss.xml">RSS</Link> / <Link to="blog/rss.xml">atom</Link>
      </div>
    </div>
  )
}
