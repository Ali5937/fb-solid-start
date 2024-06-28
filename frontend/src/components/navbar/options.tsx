import IconSun from "~/assets/icon-sun";
import IconMoon from "~/assets/icon-moon";
import { Show } from "solid-js";
export default function Options(props: any) {
  function toggleTheme() {
    props.setTheme(
      props.theme() === "dark-theme" ? "light-theme" : "dark-theme"
    );

    // console.log(props.theme() === "dark-theme" ? "dark-theme" : "light-theme");
  }

  return (
    <div
      class="dropdown-element-right button-style"
      onmousedown={(event) => {
        event.stopPropagation();
      }}
      onclick={(event) => {
        event.stopPropagation();
      }}
    >
      <div class="theme">
        <div>Dark Mode: </div>
        <button class="theme-button" onClick={toggleTheme}>
          <Show when={props.theme() === "dark-theme"}>
            <IconSun />
          </Show>
          <Show when={props.theme() === "light-theme"}>
            <IconMoon />
          </Show>
        </button>
      </div>
    </div>
  );
}
