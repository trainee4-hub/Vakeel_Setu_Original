import React from "react";
import {
  useSearchParams,
} from "react-router-dom";

import Login from "./Login";
import AccountExistsPage from "./AccountExistsPage";

const UserLoginPage = () => {
  const [searchParams] =
    useSearchParams();

  const error =
    searchParams.get("error");

  if (
    error === "account_exists"
  ) {
    return (
      <AccountExistsPage type="user" />
    );
  }

  return <Login />;
};

export default UserLoginPage;