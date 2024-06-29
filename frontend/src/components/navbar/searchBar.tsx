import { For, Show, createSignal, onMount } from "solid-js";

export default function SearchBar(props: any) {
  let inputRef: HTMLInputElement | undefined;
  const [inputValue, setInputValue] = createSignal("");
  const [searchResults, setSearchResults] = createSignal([]);
  let lastInputTime = Date.now();

  async function getInput(event: InputEvent) {
    const millisecondsSinceLastInput = Date.now() - lastInputTime;
    const target = event.target as HTMLInputElement;
    setInputValue(target.value);
    if (inputValue().length >= 3) {
      if (millisecondsSinceLastInput >= 1000) {
        const response = await fetch(
          `${props.baseUrl}/search?` +
            new URLSearchParams({
              inputValue: inputValue(),
            })
        );
        if (response.ok) {
          const responseData = await response.json();
          setSearchResults(responseData.responseData.results);
        }
      } else {
        setTimeout(() => {
          if (Date.now() - lastInputTime >= 1000) getInput(event);
        }, 1000);
      }
    } else {
      setSearchResults([]);
    }
    lastInputTime = Date.now();
  }

  onMount(() => {
    if (inputRef) {
      inputRef.focus();
    }
  });

  return (
    <div
      class="dropdown-element-left"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <input
        class="dropdown-element-left button-style highlighted"
        ref={inputRef}
        onInput={getInput}
        placeholder="Search..."
      />
      <Show when={searchResults().length > 0}>
        <div class="search-results button-style">
          <For each={searchResults()}>
            {(res: any) => <div>{res.formatted}</div>}
          </For>
        </div>
      </Show>
    </div>
  );
}
