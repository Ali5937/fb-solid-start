import { Show, Suspense, createSignal, lazy, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import IconLogo from "../../assets/icon-logo";
import IconOptions from "../../assets/icon-options";
import "./navbar.css";
import { currentCurrency, saleType } from "~/utils/store";

const SearchBar = lazy(() => import("./searchBar"));
const Filter = lazy(() => import("./filter"));
const Currency = lazy(() => import("./currency"));
const Units = lazy(() => import("./units"));
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
                isAll={false}
                setOpenDropdownNumber={props.setOpenDropdownNumber}
                markers={props.markers}
                setMarkers={props.setMarkers}
                propertyItems={props.propertyItems}
                setPropertyItems={props.setPropertyItems}
                itemSort={props.itemSort}
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
            {saleType()[0]?.toUpperCase() + saleType().slice(1)}
          </div>
          <Suspense>
            <Show when={props.openDropdownNumber() === 2}>
              <Filter />
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
            setDropdown(0);
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
          {currentCurrency() ? (
            <div class="currency-text">
              <div>{currentCurrency()?.symbol}</div>
              <div>{currentCurrency()?.code}</div>
            </div>
          ) : (
            <div class="currency-symbols">
              <sup>$</sup>⁄<sub>€</sub>
            </div>
          )}
          <Suspense>
            <Show when={props.openDropdownNumber() === 5}>
              <div class="dropdown-element-right button-style">
                <Currency
                  isAddItem={false}
                  displayUnits={props.displayUnits}
                  setDisplayUnits={props.setDisplayUnits}
                />
                <div class="separation"></div>
                <Units
                  displayUnits={props.displayUnits}
                  setDisplayUnits={props.setDisplayUnits}
                />
              </div>
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
              <Options />
            </Show>
          </Suspense>
        </button>
      </div>
    </div>
  );
}
