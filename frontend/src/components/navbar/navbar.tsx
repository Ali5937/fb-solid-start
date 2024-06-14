import { Show, Suspense, createSignal, lazy, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import IconLogo from "../../assets/icon-logo";
import IconOptions from "../../assets/icon-options";
import "./navbar.css";
import IconMessage from "~/assets/icon-message";

const SearchBar = lazy(() => import("./searchbar"));
const Filter = lazy(() => import("./filter"));
const Message = lazy(() => import("./message"));
const Login = lazy(() => import("./login"));
const Currency = lazy(() => import("./currency"));
const Options = lazy(() => import("./options"));

export default function Navbar(props: any) {
  const [openDropdownNumber, setOpenDropdownNumber] = createSignal<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal<boolean>(false);

  function setDropdown(dropNum: number) {
    if (dropNum === openDropdownNumber()) {
      setOpenDropdownNumber(0);
    } else {
      setOpenDropdownNumber(dropNum);
      setIsDropdownOpen(true);
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target?.closest(".nav-button")) {
      setOpenDropdownNumber(0);
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
          class={`search-nav nav-button ${
            openDropdownNumber() === 1 && isDropdownOpen()
              ? "highlighted-dropdown"
              : ""
          }`}
          onmousedown={() =>
            openDropdownNumber() === 1 && setIsDropdownOpen(false)
          }
          onClick={() => setDropdown(1)}
        >
          <div class="nav-button-element">&#128270;</div>
          <Suspense>
            <Show when={openDropdownNumber() === 1}>
              <SearchBar />
            </Show>
          </Suspense>
        </button>
        <button
          class={`filter-nav nav-button ${
            openDropdownNumber() === 2 && isDropdownOpen()
              ? "highlighted-dropdown"
              : ""
          }`}
          onmousedown={() =>
            openDropdownNumber() === 2 && setIsDropdownOpen(false)
          }
          onClick={() => setDropdown(2)}
        >
          <div class="nav-button-element">
            {props.saleType()[0].toUpperCase() + props.saleType().slice(1)}
          </div>
          <Suspense>
            <Show when={openDropdownNumber() === 2}>
              <Filter
                currentRentMax={props.currentRentMax}
                currentBuyMax={props.currentBuyMax}
                setTheme={props.setTheme}
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
          class={`message-nav nav-button ${
            openDropdownNumber() === 3 && isDropdownOpen()
              ? "highlighted-dropdown"
              : ""
          }`}
          onmousedown={() =>
            openDropdownNumber() === 3 && setIsDropdownOpen(false)
          }
          onClick={() => setDropdown(3)}
        >
          <IconMessage />
          <Suspense>
            <Show when={openDropdownNumber() === 3}>
              <Message />
            </Show>
          </Suspense>
        </button>
        <button
          class={`login-nav nav-button ${
            openDropdownNumber() === 4 && isDropdownOpen()
              ? "highlighted-dropdown"
              : ""
          }`}
          onmousedown={() =>
            openDropdownNumber() === 4 && setIsDropdownOpen(false)
          }
          onClick={() => setDropdown(4)}
        >
          <div class="nav-button-element">Login</div>
          <Suspense>
            <Show when={openDropdownNumber() === 4}>
              <Login />
            </Show>
          </Suspense>
        </button>
        <button
          class={`currency-nav nav-button ${
            openDropdownNumber() === 5 && isDropdownOpen()
              ? "highlighted-dropdown"
              : ""
          }`}
          onmousedown={() =>
            openDropdownNumber() === 5 && setIsDropdownOpen(false)
          }
          onClick={() => setDropdown(5)}
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
            <Show when={openDropdownNumber() === 5}>
              <Currency />
            </Show>
          </Suspense>
        </button>
        <button
          class={`options-nav nav-button ${
            openDropdownNumber() === 6 && isDropdownOpen()
              ? "highlighted-dropdown"
              : ""
          }`}
          onmousedown={() =>
            openDropdownNumber() === 6 && setIsDropdownOpen(false)
          }
          onClick={() => setDropdown(6)}
        >
          <IconOptions />
          <Suspense>
            <Show when={openDropdownNumber() === 6}>
              <Options />
            </Show>
          </Suspense>
        </button>
      </div>
    </div>
  );
}
