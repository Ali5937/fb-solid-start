import { baseUrl, setUserId } from "~/utils/store";
import "./account.css";
import { Show, createSignal } from "solid-js";
import { createForm } from "@tanstack/solid-form";
import { z } from "zod";

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
    const response = await fetch(
      `${baseUrl}/user/email?email=${encodeURIComponent(email())}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    //If user Exists already
    if (response.status === 200) {
      setLoginType(2);
      //If user DOESN'T Exist already
    } else if (response.status === 204) {
      setLoginType(1);
    }
  }

  async function sendPostSignup() {
    const data = {
      email: email(),
      password: password(),
    };

    try {
      const result = await fetch(`${baseUrl}/user/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("signup result: ", result);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  async function sendPostLogin() {
    const data = {
      email: email(),
      password: password(),
    };

    const result = await fetch(`${baseUrl}/user/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(result);
    if (result.status === 200) {
      props.setIsLoggedIn(true);
      setUserId(result.user_id);
    }
    console.log("login result: ", result.status);
  }

  function isEmailValid(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const form = createForm(() => ({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
    },
  }));

  return (
    <div class="login">
      <div class="login-type">{loginType() === 1 ? "Sign Up" : "Login"}</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          validators={{
            onChange: z.string().email(),
          }}
          children={(field) => (
            <>
              <input
                name={field().name}
                value={field().state.value}
                onBlur={field().handleBlur}
                onInput={(e) => {
                  field().handleChange(e.target.value);
                  setEmail(e.target.value);
                }}
              />
              <div class="error-message">{field().state.meta.errors}</div>
            </>
          )}
        />
        <Show when={loginType() !== 0}>
          <div class="login-password-parent">
            <label for="login-password">Password</label>
            <form.Field
              name="password"
              children={(field) => (
                <input
                  name={field().name}
                  value={field().state.value}
                  onBlur={field().handleBlur}
                  onInput={(e) => {
                    field().handleChange(e.target.value);
                    setPassword(e.target.value);
                  }}
                />
              )}
            />
          </div>
        </Show>
      </form>
      {/* <div class="login-email-parent">
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
      </Show> */}
      <button onMouseDown={sendRequest}>OK</button>
    </div>
  );
}
