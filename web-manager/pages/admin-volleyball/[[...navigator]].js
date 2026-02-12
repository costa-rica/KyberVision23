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
    if (route === "contract-team-player") {
      return import(
        `../../components/AdminVolleyball/ContractTeamPlayerTable`
      ).catch(() => () => <p>Table Not Found</p>);
    } else if (route === "leagues") {
      return import(`../../components/AdminVolleyball/LeaguesTable`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "players") {
      return import(`../../components/AdminVolleyball/PlayersTable`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "sessions") {
      return import(`../../components/AdminVolleyball/SessionsTable`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "teams") {
      return import(`../../components/AdminVolleyball/TeamsTable`).catch(
        () => () => <p>Table Not Found</p>
      );
    } else if (route === "users") {
      return import(`../../components/AdminVolleyball/UsersTable`).catch(
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
