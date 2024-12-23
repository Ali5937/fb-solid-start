import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import XIcon from "../../assets/icon-x-border";
import IconSpinner from "~/assets/icon-spinner";
import { GetItemType, SearchItems } from "~/utils/SearchItems";

import {
  rentPriceRange,
  buyPriceRange,
  rentMax,
  buyMax,
  saleType,
  itemType,
  baseUrl,
  defaultCountry,
  defaultState,
  selectedState,
  selectedCountry,
  setStates,
  setSelectedCountry,
  setSelectedState,
  setSelectedCity,
  selectedCity,
  states,
  setCountries,
  countries,
  inputValue,
  setInputValue,
  selectState,
} from "~/utils/store";

export default function SearchBar(props: any) {
  let inputRef: HTMLInputElement | undefined;
  const [searchResults, setSearchResults] = createSignal([]);
  const [isSearching, setIsSearching] = createSignal(false);

  const startTime = 700;
  const interval = 10;
  let timer = startTime;
  let hasNewInput = false;
  let searchImmediately = false;

  setInterval(() => {
    if (timer >= interval && hasNewInput) timer = timer - interval;
    if (
      inputValue().length >= 3 &&
      ((timer <= 0 && hasNewInput) || searchImmediately)
    ) {
      getSearch();
      timer = startTime;
      hasNewInput = false;
      searchImmediately = false;
    }
  }, interval);

  async function getSearch() {
    setIsSearching(true);
    const type = GetItemType(null, itemType(), saleType());
    let min, max: number;
    if (saleType() == "rent") {
      [min, max] = rentPriceRange();
    } else {
      [min, max] = buyPriceRange();
    }
    const response = await fetch(
      `${baseUrl}/cities?` +
        new URLSearchParams({
          type: type.toString(),
          min: min.toString(),
          max: max.toString(),
          city: inputValue(),
          state: selectedState(),
          country: selectedCountry(),
        })
    ).then((res) => res.json());
    setIsSearching(false);
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
    if (countries().length > 1) return;
    const res = await fetch(`${baseUrl}/countries`).then((res) => res.json());
    const resCountries: string[] = [defaultCountry, ...res.data];
    setCountries(resCountries);
  }

  async function searchCountry(country: string) {
    setSelectedCountry(country || "");
    setSelectedState("");
    setSelectedCity("");
    setInputValue("");
    setSearchResults([]);
    const res = await fetch(
      `${baseUrl}/states?` +
        new URLSearchParams({
          country: selectedCountry(),
        })
    ).then((res) => res.json());

    let statesArr: string[] = [];
    res.data?.forEach((stateEl: any) => {
      if (stateEl.length > 0) {
        statesArr.push(stateEl);
      }
      searchImmediately = true;
    });

    const resStates: string[] = [defaultState, ...statesArr];
    setStates(resStates);
    await getSearchItems();
  }

  async function searchState(state: string) {
    setSelectedState(state || "");
    setSelectedCity("");
    setInputValue("");
    setSearchResults([]);
    searchImmediately = true;
    await getSearchItems();
  }

  async function clickCity(res: any) {
    searchCountry(res.Country);
    setSelectedCountry(res.Country);
    setSelectedState(res.State);
    setSelectedCity(res.City);
    props.setOpenDropdownNumber(0);
    setInputValue(res.City);
    await getSearchItems(res.Lng, res.Lat);
  }

  function clickInput() {
    if (searchResults()?.length == 0) searchImmediately = true;
  }

  async function getSearchItems(cityLng?: number, cityLat?: number) {
    const priceRange =
      saleType() === "rent" ? rentPriceRange() : buyPriceRange();
    const resultItems = await SearchItems(
      true,
      null,
      null,
      null,
      saleType(),
      itemType(),
      baseUrl,
      priceRange,
      rentMax,
      buyMax,
      props.itemSort(),
      selectedCountry(),
      selectedState(),
      selectedCity()
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
    let lngLow = arr[0].Lng;
    let lngHigh = arr[0].Lng;
    let latLow = arr[0].Lat;
    let latHigh = arr[0].Lat;
    for (let i = 0; i < arr.length; i++) {
      if (lngLow > arr[i].Lng) lngLow = arr[i].Lng;
      if (lngHigh < arr[i].Lng) lngHigh = arr[i].Lng;
      if (latLow > arr[i].Lat) latLow = arr[i].Lat;
      if (latHigh < arr[i].Lat) latHigh = arr[i].Lat;
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

  function removeCountry() {
    searchCountry("");
    setSelectedCountry("");
    setInputValue("");
  }

  function removeState() {
    searchState("");
    setSelectedState("");
    setInputValue("");
  }

  function removeInput() {
    setInputValue("");
    setSearchResults([]);
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
          <div class="search-field-parent">
            <select
              value={selectedCountry()}
              onChange={(e) => searchCountry(e.currentTarget?.value)}
            >
              <option value="" selected disabled hidden>
                {selectedCountry() || defaultCountry}
              </option>
              <For each={countries()}>
                {(res: any) => (
                  <option value={res === defaultCountry ? "" : res}>
                    {res}
                  </option>
                )}
              </For>
            </select>
            <Show when={selectedCountry()}>
              <div class="icon-x-border" onclick={removeCountry}>
                <XIcon />
              </div>
            </Show>
          </div>
        </div>
        <Show
          when={
            selectedCountry() !== "" &&
            (states().length > 1 || selectedCity() !== "")
          }
        >
          <div class="separation"></div>
          <div class="search-element select-state">
            <div class="title">State</div>
            <div class="search-field-parent">
              <select
                value={selectedState()}
                onChange={(e) => searchState(e.currentTarget?.value)}
              >
                <option value="" selected disabled hidden>
                  {selectedState() || defaultState}
                </option>
                <For each={states()}>
                  {(res: any) => (
                    <option value={res === defaultState ? "" : res}>
                      {res}
                    </option>
                  )}
                </For>
              </select>
              <Show when={selectedState()}>
                <div class="icon-x-border" onclick={removeState}>
                  <XIcon />
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </div>
      <div class="separation"></div>
      <div class="search-element">
        <div class="title">Search Cities</div>
        <div class="search-field-parent">
          <input
            class="button-style highlighted"
            ref={inputRef}
            onInput={getInput}
            onfocus={clickInput}
            placeholder="Search..."
            value={inputValue()}
          />
          <Show when={inputValue()}>
            <div class="icon-x-border" onclick={removeInput}>
              <XIcon />
            </div>
          </Show>
        </div>
      </div>
      <Show when={isSearching()}>
        <div class="spinner">
          <IconSpinner />
        </div>
      </Show>
      <Show when={searchResults()?.length > 0}>
        <div class="search-result-parent">
          <div>
            <Show when={!isSearching()}>
              <For each={searchResults()}>
                {(res: any) => (
                  <div class="search-result" onMouseDown={() => clickCity(res)}>
                    <div class="city-name">{res.City}</div>
                    <div>
                      <div>{res.State},</div>
                      <div>{res.Country}</div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}
