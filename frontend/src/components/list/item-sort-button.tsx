import { createSignal } from "solid-js";

export default function ItemSortButton(props: any) {
  const [windowOpen, setWindowOpen] = createSignal(false);

  let currentItemSortStartValue = "New";

  if (props.itemSort() === "low") {
    currentItemSortStartValue = "Price: Low";
  } else if (props.itemSort() === "high") {
    currentItemSortStartValue = "Price: High";
  }

  const [currentItemSort, setCurrentItemSort] = createSignal(
    currentItemSortStartValue
  );

  return (
    <div class={`list-button-parent${windowOpen() ? " window-open" : ""}`}>
      <div class={`list-button-window${windowOpen() ? " window-open" : ""}`}>
        <div class="list-button-current">
          <button onMouseDown={() => setWindowOpen(!windowOpen())}>
            {currentItemSort()}
          </button>
        </div>
        <div class="list-button-all">
          <button
            class={`${props.itemSort() === "new" ? "highlighted" : ""}`}
            onMouseDown={() => {
              setWindowOpen(!windowOpen());
              props.setItemSort("new");
              setCurrentItemSort("New");
            }}
          >
            New
          </button>
          <button
            class={`${props.itemSort() === "low" ? "highlighted" : ""}`}
            onMouseDown={() => {
              setWindowOpen(!windowOpen());
              props.setItemSort("low");
              setCurrentItemSort("Price: Low");
            }}
          >
            Price: Low
          </button>
          <button
            class={`${props.itemSort() === "high" ? "highlighted" : ""}`}
            onMouseDown={() => {
              setWindowOpen(!windowOpen());
              props.setItemSort("high");
              setCurrentItemSort("Price: High");
            }}
          >
            Price: High
          </button>
        </div>
      </div>
    </div>
  );
}
