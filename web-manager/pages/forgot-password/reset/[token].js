import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ResetPassword from "../../../components/ManageUser/ResetPassword";

const ResetPasswordPage = () => {
	const router = useRouter();
	const [token, setToken] = useState(null);

	useEffect(() => {
		// we need this because: The issue is that router.query.token is initially undefined because
		// Next.js initializes the page before fully resolving the query parameters, especially on the
		//first render. This happens because Next.js uses client-side hydration.
		if (router.isReady) {
			console.log("-----> router.query:", router.query);
			setToken(router.query.token);
		}
	}, [router.isReady, router.query]);

	if (!token) {
		return <p>Loading...</p>; // Prevents undefined token error on initial render
	}

	return <ResetPassword token={token} />;
};

export default ResetPasswordPage;
