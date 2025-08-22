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
          <li className={styles.item}>
            August 22, 2025 - <Link to="/blog/bun-engine/">Bun engine</Link>
          </li>
          <li className={styles.item}>
            July 25, 2024 - <Link to="/blog/npm-package-provenance/">npm package provenance</Link>
          </li>
          <li className={styles.item}>
            July 12, 2024 - <Link to="/blog/monorepo/">Socket.IO monorepo</Link>
          </li>
          <li className={styles.item}>
            March 29, 2024 - <Link to="/blog/three-new-adapters/">Three new adapters</Link>
          </li>
          <li className={styles.item}>
            January 12, 2024 - <Link to="/blog/chat-platform/">Chat platform</Link>
          </li>
        </ul>
        Blog feed: <a href="/blog/rss.xml">RSS</a> / <a href="/blog/atom.xml">atom</a>
      </div>
    </div>
  )
}
