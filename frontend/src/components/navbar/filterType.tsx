import { Show } from "solid-js";

export default function FilterType(props: any) {
  return (
    <>
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
      <Show when={props.saleType() !== ""}>
        <div class="separation"></div>
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
      </Show>
    </>
  );
}
