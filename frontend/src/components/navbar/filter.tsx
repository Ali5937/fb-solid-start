import { Show, lazy } from "solid-js";
import DualSlider from "./dualSlider";

export default function Filter(props: any) {
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
      <div class="search-container">
        <button
          class={props.saleType() === "rent" ? "highlighted-filter" : ""}
          onClick={() => props.setSaleType("rent")}
        >
          Rent
        </button>
        <button
          class={props.saleType() === "buy" ? "highlighted-filter" : ""}
          onClick={() => {
            props.setSaleType("buy");
            if (props.itemType() === "shared") {
              props.setItemType("house");
            }
          }}
        >
          Buy
        </button>
      </div>
      <div class="nav-line"></div>
      <div class="search-container">
        <button
          class={props.itemType() === "apartment" ? "highlighted-filter" : ""}
          onClick={() => props.setItemType("apartment")}
        >
          Apartment
        </button>
        <button
          class={props.itemType() === "house" ? "highlighted-filter" : ""}
          onClick={() => props.setItemType("house")}
        >
          House
        </button>
        <Show when={props.saleType() === "rent"}>
          <button
            class={
              props.itemType() === "shared"
                ? "highlighted-filter"
                : "shared-button"
            }
            onClick={() => props.setItemType("shared")}
          >
            {window.innerWidth >= 1000 ? "Shared Apartment" : "Shared"}
          </button>
        </Show>
        <Show when={props.saleType() === "buy"}>
          <button
            class={props.itemType() === "land" ? "highlighted-filter" : ""}
            onClick={() => props.setItemType("land")}
          >
            Land
          </button>
        </Show>
      </div>
      <div class="nav-line"></div>
      <div class="slider-container">
        <DualSlider
          currentRentMax={props.currentRentMax}
          currentBuyMax={props.currentBuyMax}
          saleType={props.saleType}
          rentPriceRange={props.rentPriceRange}
          setRentPriceRange={props.setRentPriceRange}
          buyPriceRange={props.buyPriceRange}
          setBuyPriceRange={props.setBuyPriceRange}
          currentCurrency={props.currentCurrency}
        />
      </div>
    </div>
  );
}
