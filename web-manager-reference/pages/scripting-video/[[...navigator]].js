import { useRouter } from "next/router";
import dynamic from "next/dynamic";
// import TemplateView from "../../components/TemplateViewOBE";
// import TemplateView from "../../components/common/TemplateView";

const AdminDbTable = () => {
  const router = useRouter();
  let route = Array.isArray(router.query.navigator)
    ? router.query.navigator[0]
    : undefined;

  if (!route) {
    route = "main"; // fallback to main if /admin-db is visited
  }

  const TableComponent = dynamic(() => {
    console.log("-----> route", route);
    if (route === "contracts-script-video") {
      return import(
        `../../components/ScriptingAndVideo/ContractsScriptVideoTable`
      ).catch(() => () => <p>Table Not Found</p>);
    } else if (route === "scripts") {
      return import(`../../components/ScriptingAndVideo/ScriptsTable`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "videos") {
      return import(`../../components/ScriptingAndVideo/VideoUpload`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else {
      return import(`../../components/Home`).catch(() => () => (
        <p>Table Not Found</p>
      ));
    }
  });

  return <TableComponent />;
};

export default AdminDbTable;
