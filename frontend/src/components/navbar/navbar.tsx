import { Show, Suspense, createSignal, lazy, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import IconLogo from "../../assets/icon-logo";
import IconOptions from "../../assets/icon-options";
import "./navbar.css";

const SearchBar = lazy(() => import("./searchBar"));
const Filter = lazy(() => import("./filter"));
const Currency = lazy(() => import("./currency"));
const Options = lazy(() => import("./options"));

export default function Navbar(props: any) {
  const [isDropdownOpen, setIsDropdownOpen] = createSignal<boolean>(false);

  function setDropdown(dropNum: number) {
    if (dropNum === props.openDropdownNumber()) {
      props.setOpenDropdownNumber(0);
    } else {
      props.setOpenDropdownNumber(dropNum);
      setIsDropdownOpen(true);
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (
      !target?.closest(".nav-button") &&
      !target?.closest(".panel") &&
      props.openDropdownNumber() !== 4
    ) {
      props.setOpenDropdownNumber(0);
      setIsDropdownOpen(false);
    }
  }

  if (!isServer) {
    document.addEventListener("mousedown", handleClickOutside);
    onCleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
    });
  }

  return (
    <div class={`navbar`}>
      <div class="nav-parent">
        <button
          aria-label="search-button"
          class={`search-nav nav-button ${
            props.openDropdownNumber() === 1 && isDropdownOpen()
              ? "highlighted"
              : ""
          }`}
          onMouseDown={() => setDropdown(1)}
        >
          <div class="nav-button-element">&#128270;</div>
          <Suspense>
            <Show when={props.openDropdownNumber() === 1}>
              <SearchBar
                baseUrl={props.baseUrl}
                setOpenDropdownNumber={props.setOpenDropdownNumber}
                saleType={props.saleType}
                itemType={props.itemType}
                setMoveMapCoordinates={props.setMoveMapCoordinates}
                markers={props.markers}
                setMarkers={props.setMarkers}
                rentPriceRange={props.rentPriceRange}
                buyPriceRange={props.buyPriceRange}
                lowestPrice={props.lowestPrice}
                setLowestPrice={props.setLowestPrice}
                highestPrice={props.highestPrice}
                setHighestPrice={props.setHighestPrice}
                states={props.states}
                setStates={props.setStates}
                selectedState={props.selectedState}
                setSelectedState={props.setSelectedState}
                defaultState={props.defaultState}
                propertyItems={props.propertyItems}
                setPropertyItems={props.setPropertyItems}
                itemSort={props.itemSort}
                countries={props.countries}
                setCountries={props.setCountries}
                selectedCountry={props.selectedCountry}
                setSelectedCountry={props.setSelectedCountry}
                defaultCountry={props.defaultCountry}
                selectedCity={props.selectedCity}
                setSelectedCity={props.setSelectedCity}
              />
            </Show>
          </Suspense>
        </button>
        <button
          aria-label="filter-button"
          class={`filter-nav button-2x nav-button ${
            props.openDropdownNumber() === 2 && isDropdownOpen()
              ? "highlighted"
              : ""
          }`}
          onMouseDown={() => setDropdown(2)}
        >
          <div class="nav-button-element">
            {props.saleType()[0].toUpperCase() + props.saleType().slice(1)}
          </div>
          <Suspense>
            <Show when={props.openDropdownNumber() === 2}>
              <Filter
                rentMax={props.rentMax}
                buyMax={props.buyMax}
                saleType={props.saleType}
                setSaleType={props.setSaleType}
                itemType={props.itemType}
                setItemType={props.setItemType}
                rentPriceRange={props.rentPriceRange}
                setRentPriceRange={props.setRentPriceRange}
                buyPriceRange={props.buyPriceRange}
                setBuyPriceRange={props.setBuyPriceRange}
                currentCurrency={props.currentCurrency}
              />
            </Show>
          </Suspense>
        </button>
      </div>
      <div class="logo-nav">
        <div class="logo-image">
          <IconLogo />
        </div>
        <div class="logo-text">Flat Bunny</div>
      </div>
      <div class="nav-parent">
        <button
          aria-label="login-button"
          class={`account-nav button-2x nav-button ${
            props.isProfileOpen() ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            props.setIsProfileOpen(!props.isProfileOpen());
            props.setIsPanelOpen(!props.isPanelOpen());
          }}
        >
          <div class="nav-button-element">Login</div>
        </button>
        <button
          aria-label="currency-button"
          class={`currency-nav nav-button ${
            props.openDropdownNumber() === 5 && isDropdownOpen()
              ? "highlighted"
              : ""
          }`}
          onMouseDown={() => setDropdown(5)}
        >
          {props.currentCurrency() ? (
            <div class="currency-text">
              <div>{props.currentCurrency()[2]}</div>
              <div>{props.currentCurrency()[0]}</div>
            </div>
          ) : (
            <div class="currency-symbols">
              <sup>$</sup>⁄<sub>€</sub>
            </div>
          )}
          <Suspense>
            <Show when={props.openDropdownNumber() === 5}>
              <Currency
                baseUrl={props.baseUrl}
                currentCurrency={props.currentCurrency}
                setCurrentCurrency={props.setCurrentCurrency}
                currencyData={props.currencyData}
                setCurrencyData={props.setCurrencyData}
                displayUnits={props.displayUnits}
                setDisplayUnits={props.setDisplayUnits}
                setOpenDropdownNumber={props.setOpenDropdownNumber}
              />
            </Show>
          </Suspense>
        </button>
        <button
          aria-label="option-button"
          class={`options-nav nav-button ${
            props.openDropdownNumber() === 6 && isDropdownOpen()
              ? "highlighted"
              : ""
          }`}
          onMouseDown={() => setDropdown(6)}
        >
          <IconOptions />
          <Suspense>
            <Show when={props.openDropdownNumber() === 6}>
              <Options theme={props.theme} setTheme={props.setTheme} />
            </Show>
          </Suspense>
        </button>
      </div>
    </div>
  );
}
