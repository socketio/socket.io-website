import React from "react";
import sponsors from "../../sponsors.json"
import styles from "./HomepageSponsors.module.css"
import Link from "@docusaurus/Link";

function Sponsor({ url, img, alt }) {
  return (
    <div className={styles.sponsor}>
      <a href={url} target="_blank" rel="sponsored noopener">
        <img src={img} alt={alt} />
      </a>
    </div>
  )
}

export default function HomepageSponsors() {
  return (
    <div className={styles.list}>
      <h3>Our sponsors</h3>
      <div>
        {sponsors.map((props, idx) => (
          <Sponsor key={idx} {...props} />
        ))}
      </div>
      <Link
        className="button button--primary"
        href="https://opencollective.com/socketio">
        Become a sponsor
      </Link>
    </div>
  )
}
