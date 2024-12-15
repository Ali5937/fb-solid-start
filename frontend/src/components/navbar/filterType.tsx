import { Show } from "solid-js";
import { itemType, saleType, setItemType, setSaleType } from "~/utils/store";

export default function FilterType(props: any) {
  return (
    <>
      <div class="filter-container">
        <button
          class={saleType() === "rent" ? "highlighted" : ""}
          onMouseDown={() => {
            setSaleType("rent");
            if (itemType() === "land") {
              setItemType("apartment");
            }
          }}
        >
          Rent
        </button>
        <button
          class={saleType() === "buy" ? "highlighted" : ""}
          onMouseDown={() => {
            setSaleType("buy");
            if (itemType() === "shared") {
              setItemType("house");
            }
          }}
        >
          Buy
        </button>
      </div>
      <Show when={saleType() !== ""}>
        <div class="separation"></div>
        <div class="filter-container">
          <button
            class={itemType() === "apartment" ? "highlighted" : ""}
            onMouseDown={() => setItemType("apartment")}
          >
            Apartment
          </button>
          <button
            class={itemType() === "house" ? "highlighted" : ""}
            onMouseDown={() => setItemType("house")}
          >
            House
          </button>
          <Show when={saleType() === "rent"}>
            <button
              class={itemType() === "shared" ? "highlighted" : "shared-button"}
              onMouseDown={() => setItemType("shared")}
            >
              Shared
            </button>
          </Show>
          <Show when={saleType() === "buy"}>
            <button
              class={itemType() === "land" ? "highlighted" : ""}
              onMouseDown={() => setItemType("land")}
            >
              Land
            </button>
          </Show>
        </div>
      </Show>
    </>
  );
}
