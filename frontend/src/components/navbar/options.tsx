import IconSun from "~/assets/icon-sun";
import IconMoon from "~/assets/icon-moon";
import { Show } from "solid-js";
import { setTheme, theme, themes } from "~/utils/store";
export default function Options(props: any) {
  function toggleTheme() {
    setTheme(theme() === themes.light ? themes.dark : themes.light);
  }

  return (
    <div
      class="dropdown-element-right button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div class="theme">
        <div>Dark Mode: </div>
        <button class="theme-button" onMouseDown={toggleTheme}>
          <Show when={theme() === themes.dark}>
            <IconSun />
          </Show>
          <Show when={theme() === themes.light}>
            <IconMoon />
          </Show>
        </button>
      </div>
    </div>
  );
}
