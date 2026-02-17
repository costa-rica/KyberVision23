import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const ForgotPassword = () => {
  const router = useRouter();
  const { screenName } = router.query;

  const ScreenComponent = dynamic(() =>
    screenName === "reset-successful"
      ? import("../../components/ManageUser/ResetSuccess")
      : Promise.resolve(() => <p>Screen Not Found</p>)
  );

  return <ScreenComponent />;
};

export default ForgotPassword;
