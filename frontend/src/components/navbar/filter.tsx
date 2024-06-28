import { Show, lazy } from "solid-js";
import DualSlider from "./dualSlider";

export default function Filter(props: any) {
  return (
    <div
      class="dropdown-element-left button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div class="filter-container">
        <button
          class={props.saleType() === "rent" ? "highlighted" : ""}
          onMouseDown={() => {
            props.setSaleType("rent");
            if (props.itemType() === "land") {
              props.setItemType("apartment");
            }
          }}
        >
          Rent
        </button>
        <button
          class={props.saleType() === "buy" ? "highlighted" : ""}
          onMouseDown={() => {
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
      <div class="filter-container">
        <button
          class={props.itemType() === "apartment" ? "highlighted" : ""}
          onMouseDown={() => props.setItemType("apartment")}
        >
          Apartment
        </button>
        <button
          class={props.itemType() === "house" ? "highlighted" : ""}
          onMouseDown={() => props.setItemType("house")}
        >
          House
        </button>
        <Show when={props.saleType() === "rent"}>
          <button
            class={
              props.itemType() === "shared" ? "highlighted" : "shared-button"
            }
            onMouseDown={() => props.setItemType("shared")}
          >
            Shared
          </button>
        </Show>
        <Show when={props.saleType() === "buy"}>
          <button
            class={props.itemType() === "land" ? "highlighted" : ""}
            onMouseDown={() => props.setItemType("land")}
          >
            Land
          </button>
        </Show>
      </div>
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
