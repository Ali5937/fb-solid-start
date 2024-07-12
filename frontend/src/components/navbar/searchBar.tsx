import { For, Show, createEffect, createSignal, onMount } from "solid-js";

export default function SearchBar(props: any) {
  let inputRef: HTMLInputElement | undefined;
  const [inputValue, setInputValue] = createSignal("");
  const [searchResults, setSearchResults] = createSignal([]);

  const startTime = 700;
  const interval = 100;
  let timer = startTime;
  let hasNewInput = false;

  setInterval(() => {
    if (timer >= interval && hasNewInput) timer = timer - interval;
    if (timer <= 0 && hasNewInput) {
      getSearch();
      timer = startTime;
      hasNewInput = false;
    }
  }, interval);

  async function getSearch() {
    const response = await fetch(
      `${props.baseUrl}/search?` +
        new URLSearchParams({
          inputValue: inputValue(),
          stateName: props.selectedState(),
          countryName: props.selectedCountry(),
        })
    ).then((res) => res.json());
    setSearchResults(response.data);
  }

  async function getInput() {
    if (!inputRef) return;
    setInputValue(inputRef.value);
    if (inputValue().length >= 1) {
      hasNewInput = true;
      timer = startTime;
    } else if (inputValue().length === 0) {
      setSearchResults([]);
    }
  }

  async function getCountries() {
    if (props.countries().length > 1) return;
    const res = await fetch(`${props.baseUrl}/get-countries?`).then((res) =>
      res.json()
    );
    const resCountries: string[] = [props.defaultCountry, ...res.data];
    props.setCountries(resCountries);
  }

  async function searchCountry(e: { currentTarget: HTMLSelectElement }) {
    const country = e.currentTarget?.value;
    props.setSelectedCountry(country || "");
    const res = await fetch(
      `${props.baseUrl}/get-results-by-country?` +
        new URLSearchParams({
          country: props.selectedCountry(),
        })
    ).then((res) => res.json());
    const resStates: string[] = [props.defaultState, ...res.data];
    props.setStates(resStates);
    getInput();
  }

  async function searchState(e: { currentTarget: HTMLSelectElement }) {
    const state = e.currentTarget?.value;
    props.setSelectedState(state || "");
    getInput();
  }

  function clickCity() {}

  createEffect(() => {
    setTimeout(() => {
      if (inputRef) {
        inputRef.focus();
      }
    }, 0);
  });

  onMount(() => {
    getCountries();
  });

  return (
    <div
      class="dropdown-element-left search-dropdown button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div class="title">Country</div>
      <div class="select-country">
        <select onChange={searchCountry}>
          <option value="" selected disabled hidden>
            {props.selectedCountry() || props.defaultCountry}
          </option>
          <For each={props.countries()}>
            {(res: any) => <option value={res}>{res}</option>}
          </For>
        </select>
      </div>
      <Show when={props.selectedCountry() !== ""}>
        <div class="title">State</div>
        <div class="select-state">
          <select onChange={searchState}>
            <option value="" selected disabled hidden>
              {props.selectedState() || props.defaultState}
            </option>
            <For each={props.states()}>
              {(res: any) => <option value={res}>{res}</option>}
            </For>
          </select>
        </div>
      </Show>
      <div class="title">Search Cities</div>
      <input
        class="button-style highlighted"
        ref={inputRef}
        onInput={getInput}
        placeholder="Search..."
      />
      <Show when={searchResults().length > 0}>
        <div class="search-result-parent">
          <div>
            <For each={searchResults()}>
              {(res: any) => (
                <div class="search-result" onMouseDown={clickCity}>
                  <div class="city-name">{res.city_name}</div>
                  <div>
                    <div>{res.state_name},</div>
                    <div>{res.country_name}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
