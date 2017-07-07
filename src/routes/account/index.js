import React from "react";
import Layout from "../../components/Layout";
import UserProfile from "../../components/UserProfile";
import { getSessionUser } from "../../reducers";

const title = "User account";

async function action({ store, path }) {
  // TODO check if token is valid and not expirated
  const state = await store.getState();
  const user = getSessionUser(state);

  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }
  return {
    title,
    chunks: ["account"],
    component: (
      <Layout>
        <UserProfile user={user} />
      </Layout>
    )
  };
}
export default action;
