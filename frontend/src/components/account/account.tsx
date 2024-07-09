import { Suspense, Show, lazy } from "solid-js";
import "./account.css";
const Login = lazy(() => import("./login"));

export default function Account(props: any) {
  async function getMessages() {
    const result = await fetch(`${props.baseUrl}/messages`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json());
    console.log(result);
  }

  async function logout() {
    const result = await fetch(`${props.baseUrl}/user/logout`, {
      method: "POST",
      credentials: "include",
    });
    const resultData = await result.json();
    if (resultData.status === "success") {
      props.setIsLoggedIn(false);
    }
    console.log("logout result: ", resultData);
  }

  return (
    <div
      class="account"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <Suspense>
        <Show when={!props.isLoggedIn()}>
          <Login baseUrl={props.baseUrl} setIsLoggedIn={props.setIsLoggedIn} />
        </Show>
      </Suspense>
      <Suspense>
        <Show when={props.isLoggedIn()}>
          <h2>Account</h2>
          <div class="account-list">
            <div class="separation"></div>
            <button onClick={getMessages}>Messages</button>
            <div class="separation"></div>
            <button onClick={logout}>Logout</button>
            <div class="separation"></div>
          </div>
        </Show>
      </Suspense>
    </div>
  );
}
