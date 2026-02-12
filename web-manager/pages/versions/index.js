import TemplateView from "../../components/common/TemplateView";
import styles from "../../styles/Versions.module.css";
import Link from "next/link";
import Version0112 from "../../components/versions/version0-11-2";

export default function LatestVersion() {
  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMain}>
          <Version0112 />
        </div>

        <Link href="/versions/past-versions">
          <p style={{ marginTop: "2rem", color: "blue", cursor: "pointer" }}>
            View Past Versions →
          </p>
        </Link>
      </main>
    </TemplateView>
  );
}
