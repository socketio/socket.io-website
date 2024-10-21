import React from "react";
import sponsors from "../../sponsors.json"
import styles from "./HomepageSponsors.module.css"
import Link from "@docusaurus/Link";
import Translate from '@docusaurus/Translate';

function Sponsor({ url, img, alt }) {
  return (
    <div className={styles.sponsor}>
      <a href={url} target="_blank" rel="sponsored noopener">
        <img src={img} alt={alt} loading={"lazy"} />
      </a>
    </div>
  )
}

export default function HomepageSponsors() {
  return (
    <div className={styles.list}>
      <h3>
        <Translate>Our sponsors</Translate>
      </h3>
      <div>
        {sponsors.map((props, idx) => (
          <Sponsor key={idx} {...props} />
        ))}
      </div>
      <Link
        className="button button--primary"
        href="https://opencollective.com/socketio">
        <Translate>Become a sponsor</Translate>
      </Link>
    </div>
  )
}
