import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import XIcon from "../../assets/icon-x-border";
import { SearchItems } from "~/utils/SearchItems";
import { LngLat } from "maplibre-gl";

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
          isAll: props.isAll,
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
    const res = await fetch(
      `${props.baseUrl}/get-countries${props.isAll ? "/all" : ""}`
    ).then((res) => res.json());
    const resCountries: string[] = [props.defaultCountry, ...res.data];
    props.setCountries(resCountries);
  }

  async function searchCountry(country: string) {
    props.setSelectedCountry(country || "");
    props.setSelectedState("");
    props.setSelectedCity("");
    const res = await fetch(
      `${props.baseUrl}/get-results-by-country?` +
        new URLSearchParams({
          country: props.selectedCountry(),
          isAll: props.isAll,
        })
    ).then((res) => res.json());
    const resStates: string[] = [props.defaultState, ...res.data];
    props.setStates(resStates);
    searchImmediately = true;
    if (inputRef) inputRef.value = "";
    await getInput();
    await getSearchItems();
  }

  async function searchState(state: string) {
    props.setSelectedState(state || "");
    props.setSelectedCity("");
    searchImmediately = true;
    if (inputRef) inputRef.value = "";
    await getInput();
    await getSearchItems();
  }

  async function clickCity(res: any) {
    searchCountry(res.country_name);
    props.setSelectedCountry(res.country_name);
    props.setSelectedState(res.state_name);
    props.setSelectedCity(res.city_name);
    props.setOpenDropdownNumber(0);
    setInputValue(res.city_name);
    await getSearchItems(res.lng, res.lat);
  }

  async function getSearchItems(cityLng?: number, cityLat?: number) {
    const priceRange =
      props.saleType() === "rent"
        ? props.rentPriceRange()
        : props.buyPriceRange();
    const resultItems = await SearchItems(
      true,
      null,
      null,
      null,
      props.saleType(),
      props.itemType(),
      props.baseUrl,
      priceRange,
      props.rentMax,
      props.buyMax,
      props.itemSort(),
      props.selectedCountry(),
      props.selectedState(),
      props.selectedCity()
    );

    props.setLowestPrice(resultItems?.lowestPrice);
    props.setHighestPrice(resultItems?.highestPrice);
    props.setMarkers(resultItems?.markers);
    props.setPropertyItems(resultItems?.propertyItems);

    if (props.propertyItems()) {
      const lowHighLngLat = getLowestHighestLngLat(props.propertyItems());
      props.setMoveMapCoordinates({
        lng1: lowHighLngLat.lngLow,
        lat1: lowHighLngLat.latLow,
        lng2: lowHighLngLat.lngHigh,
        lat2: lowHighLngLat.latHigh,
      });
    } else if (cityLng && cityLat) {
      props.setMoveMapCoordinates({
        lng1: cityLng - 0.02,
        lat1: cityLat - 0.02,
        lng2: cityLng + 0.02,
        lat2: cityLat + 0.02,
      });
    }
  }

  function getLowestHighestLngLat(arr: any) {
    let lngLow = arr[0].lng;
    let lngHigh = arr[0].lng;
    let latLow = arr[0].lat;
    let latHigh = arr[0].lat;
    for (let i = 0; i < arr.length; i++) {
      if (lngLow > arr[i].lng) lngLow = arr[i].lng;
      if (lngHigh < arr[i].lng) lngHigh = arr[i].lng;
      if (latLow > arr[i].lat) latLow = arr[i].lat;
      if (latHigh < arr[i].lat) latHigh = arr[i].lat;
    }
    if (lngLow === lngHigh && latLow === latHigh) {
      return {
        lngLow: lngLow - 0.01,
        latLow: latLow - 0.01,
        lngHigh: lngHigh + 0.01,
        latHigh: latHigh + 0.01,
      };
    } else {
      return { lngLow, latLow, lngHigh, latHigh };
    }
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
          <select onChange={(e) => searchCountry(e.currentTarget?.value)}>
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
          <div class="separation"></div>
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
      <div class="separation"></div>
      <div class="search-element">
        <div class="title">Search Cities</div>
        <input
          class="button-style highlighted"
          ref={inputRef}
          onInput={getInput}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder="Search..."
          value={inputValue()}
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
