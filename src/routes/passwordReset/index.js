import React from "react";
import Layout from "../../components/Layout";
import PasswordReset from "./PasswordReset";

const title = "Reset your Password";

async function action(store, { token }) {
  // TODO check if token is valid and not expirated
  return {
    chunks: ["passwordReset"],
    title,
    component: <Layout><PasswordReset token={token} />
      {" "}</Layout>
  };
}

export default action;
