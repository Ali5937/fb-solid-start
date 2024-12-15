import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import "./list.css";
import ItemSortButton from "./item-sort-button";
import Item from "./item";

export default function List(props: any) {
  let list: any;
  const [visibleItemCount, setVisibleItemCount] = createSignal(
    props.isCrawler ? 500 : 0
  );
  const [itemDetails, setItemDetails] = createSignal();
  const [isFocused, setIsFocused] = createSignal<boolean>(false);
  const [isLowHeight, setIsLowheight] = createSignal<boolean>(false);

  function handleScroll() {
    const itemHeight =
      props.windowHeight() < 768 && props.windowHeight() < props.windowWidth()
        ? props.windowHeight() / 2
        : props.windowHeight() / 4;
    const numberOfItemsInRow = 2;
    const itemsOnScreen = 8;
    const margin = 2;
    const newCount =
      Math.floor(list.scrollTop / itemHeight) * numberOfItemsInRow +
      itemsOnScreen +
      margin;
    if (newCount > visibleItemCount()) setVisibleItemCount(newCount);
  }

  async function getId() {
    if (props.selectedItem()) {
      const response = await fetch(
        `${props.baseUrl}/item?` +
          new URLSearchParams({
            id: props.selectedItem().id,
          })
      );
      if (response.ok) {
        const responseData = await response.json();
        setItemDetails(responseData.data[0]);
      }
    }
  }

  createEffect(() => {
    list.scrollTop = 0;
  });

  createEffect(() => {
    getId();
    let targetDiv = document.getElementById("selected-list-item");
    if (targetDiv) {
      targetDiv.scrollIntoView({ behavior: "auto" });
    }
  });

  createEffect(() => {
    setIsLowheight(
      props.windowHeight() < 768 && props.windowHeight() < props.windowWidth()
    );
  });

  onMount(() => {
    list.addEventListener("scroll", handleScroll);
    handleScroll();
  });

  return (
    <div ref={list} class={`list ${isLowHeight() ? "low-height" : ""}`}>
      <ItemSortButton
        setIsProfileOpen={props.setIsProfileOpen}
        isPanelOpen={props.isPanelOpen}
        itemSort={props.itemSort}
        setItemSort={props.setItemSort}
      />
      <For each={props.propertyItems()}>
        {(item, index) => (
          <Show when={index() < visibleItemCount()}>
            <Item
              item={item}
              itemDetails={itemDetails}
              selectedItem={props.selectedItem}
              setSelectedItem={props.setSelectedItem}
              setHighlightedItemLngLat={props.setHighlightedItemLngLat}
              displayUnits={props.displayUnits}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
            />
          </Show>
        )}
      </For>
    </div>
  );
}
