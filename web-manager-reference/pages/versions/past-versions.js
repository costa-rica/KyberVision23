import TemplateView from "../../components/common/TemplateView";
import styles from "../../styles/Versions.module.css";
import Version0020 from "../../components/versions/version0-02-0";
import Version0050 from "../../components/versions/version0-05-0";
import Version0051 from "../../components/versions/version0-05-1";
import Version0060 from "../../components/versions/version0-06-0";
import Version0105 from "../../components/versions/version0-10-5";
import Version0090 from "../../components/versions/version0-09-0";
export default function PastVersions() {
  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMain}>
          <Version0105 />
          <Version0090 />
          <Version0060 />
          <Version0051 />
          <Version0050 />
          <Version0020 />
        </div>
      </main>
    </TemplateView>
  );
}
