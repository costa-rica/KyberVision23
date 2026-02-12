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
    if (route === "manage-db-backups") {
      return import(`../../components/admin-db/ManageDbBackups`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "manage-db-uploads") {
      return import(`../../components/admin-db/ManageDbUploads`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "manage-db-deletes") {
      return import(`../../components/admin-db/ManageDbDeletes`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "main") {
      return import(`../../components/admin-db/Main`).catch(() => () => (
        <p>Table Not Found</p>
      ));
    } else {
      return Promise.resolve(() => <p>Table Not Found</p>);
    }
  });

  return <TableComponent />;
};

export default AdminDbTable;
