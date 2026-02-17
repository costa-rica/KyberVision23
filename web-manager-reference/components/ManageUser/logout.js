// import Home from '../components/Home';
import { useDispatch } from "react-redux";
import { logoutUser } from "../../reducers/user";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Logout() {
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    dispatch(logoutUser());
    router.push("/");
  }, []);
  return <div>Logout Screen</div>;
}
