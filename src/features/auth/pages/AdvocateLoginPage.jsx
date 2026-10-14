import { useSearchParams } from "react-router-dom";
import Login from "./Login";
import AccountExistsPage from "./AccountExistsPage";

const AdvocateLoginPage = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  if (error === "advocate_exists") {
    return <AccountExistsPage type="advocate" />;
  }

  return <Login />;
}

export default AdvocateLoginPage;