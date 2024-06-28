import { onMount } from "solid-js";

export default function SearchBar(props: any) {
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    if (inputRef) {
      inputRef.focus();
    }
  });
  return (
    <div
      class="dropdown-element-left button-style"
      onmousedown={(event) => {
        event.stopPropagation();
      }}
      onclick={(event) => {
        event.stopPropagation();
      }}
    >
      <input ref={inputRef} placeholder="Search..." />
    </div>
  );
}
