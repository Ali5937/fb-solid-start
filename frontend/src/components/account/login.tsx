import "./account.css";
import { Show, createSignal } from "solid-js";

export default function Login(props: any) {
  const [email, setEmail] = createSignal<string>("");
  const [password, setPassword] = createSignal<string>("");
  const [loginType, setLoginType] = createSignal(0); // 1 sign up, 2 login

  async function sendRequest() {
    if (loginType() === 0) sendGetEmail();
    else if (loginType() === 1) sendPostSignup();
    else if (loginType() === 2) sendPostLogin();
  }

  // If email exists already login, otherwise sign up
  async function sendGetEmail() {
    const response = await fetch(`${props.baseUrl}/user/email/${email()}`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json());
    //If user DOESN'T Exist already
    if (response.status === 204) {
      setLoginType(1);
      //If user Exists already
    } else if (response.status === 200) {
      setLoginType(2);
    }
  }

  async function sendPostSignup() {
    const data = {
      email: email(),
      password: password(),
    };

    try {
      const result = await fetch(`${props.baseUrl}/user/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resultData = result.json();
      console.log("signup result: ", resultData);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  async function sendPostLogin() {
    const data = {
      email: email(),
      password: password(),
    };

    const result = await fetch(`${props.baseUrl}/user/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
    if (result.status === "success") {
      props.setIsLoggedIn(true);
      props.setUserId(result.userId);
    }
    console.log("login result: ", result.status);
  }

  return (
    <div class="login">
      <div class="login-type">{loginType() === 1 ? "Sign Up" : "Login"}</div>
      <div class="login-email-parent">
        <label for="login-email">Email</label>
        <input
          type="text"
          id="login-email"
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
        />
      </div>
      <Show when={loginType() !== 0}>
        <div class="login-password-parent">
          <label for="login-password">Password</label>
          <input
            type="text"
            id="login-password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
          />
        </div>
      </Show>
      <button onClick={sendRequest}>OK</button>
    </div>
  );
}
