import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import XIcon from "../../assets/icon-x-border";

export default function SearchBar(props: any) {
  let inputRef: HTMLInputElement | undefined;
  const [inputValue, setInputValue] = createSignal("");
  const [searchResults, setSearchResults] = createSignal([]);
  const [isInputFocused, setIsInputFocused] = createSignal(false);

  const startTime = 700;
  const interval = 10;
  let timer = startTime;
  let hasNewInput = false;
  let searchImmediately = false;

  setInterval(() => {
    if (timer >= interval && hasNewInput) timer = timer - interval;
    if ((timer <= 0 && hasNewInput) || searchImmediately) {
      getSearch();
      timer = startTime;
      hasNewInput = false;
      searchImmediately = false;
    }
  }, interval);

  async function getSearch() {
    const response = await fetch(
      `${props.baseUrl}/search?` +
        new URLSearchParams({
          inputValue: inputValue(),
          stateName: props.selectedState(),
          countryName: props.selectedCountry(),
          country: props.selectedCountry(),
          state: props.selectedState(),
          city: props.selectedCity(),
        })
    ).then((res) => res.json());
    setSearchResults(response.data);
  }

  async function getInput() {
    if (!inputRef) return;
    if (inputRef.value) inputRef.focus();
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

  async function searchCountry(country: string, isClickCity: boolean) {
    props.setSelectedCountry(country || "");
    if (!isClickCity) {
      props.setSelectedState("");
      props.setSelectedCity("");
    }
    const res = await fetch(
      `${props.baseUrl}/get-results-by-country?` +
        new URLSearchParams({
          country: props.selectedCountry(),
        })
    ).then((res) => res.json());
    const resStates: string[] = [props.defaultState, ...res.data];
    props.setStates(resStates);
    searchImmediately = true;
    getInput();
  }

  function searchState(state: string) {
    props.setSelectedState(state || "");
    props.setSelectedCity("");
    searchImmediately = true;
    getInput();
  }

  async function clickCity(res: any) {
    await searchCountry(res.country_name, true);
    props.setSelectedCountry(res.country_name || "");
    props.setSelectedState(res.state_name || "");
    props.setSelectedCity(res.city_name || "");
    inputRef?.blur();
    setInputValue(res.city_name);
  }

  onMount(() => {
    getCountries();
  });

  return (
    <div
      class={`dropdown-element-left search-dropdown button-style`}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div>
        <div class="search-element select-country">
          <div class="title">Country</div>
          <select
            onChange={(e) => searchCountry(e.currentTarget?.value, false)}
          >
            <option value="" selected disabled hidden>
              {props.selectedCountry() || props.defaultCountry}
            </option>
            <For each={props.countries()}>
              {(res: any) => (
                <option value={res === props.defaultCountry ? "" : res}>
                  {res}
                </option>
              )}
            </For>
          </select>
        </div>
        <Show
          when={
            props.selectedCountry() !== "" &&
            (props.states().length > 1 || props.selectedCity() !== "")
          }
        >
          <div class="search-element select-state">
            <div class="title">State</div>
            <select onChange={(e) => searchState(e.currentTarget?.value)}>
              <option value="" selected disabled hidden>
                {props.selectedState() || props.defaultState}
              </option>
              <For each={props.states()}>
                {(res: any) => (
                  <option value={res === props.defaultState ? "" : res}>
                    {res}
                  </option>
                )}
              </For>
            </select>
          </div>
        </Show>
      </div>
      <div class="search-element">
        <div class="title">Search Cities</div>
        <input
          class="button-style highlighted"
          ref={inputRef}
          onInput={getInput}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder="Search..."
        />
      </div>
      <Show when={isInputFocused() && searchResults().length > 0}>
        <div class="search-result-parent">
          <div>
            <For each={searchResults()}>
              {(res: any) => (
                <div class="search-result" onMouseDown={() => clickCity(res)}>
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
