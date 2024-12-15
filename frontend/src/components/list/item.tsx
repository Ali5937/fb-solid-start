import { createSignal, Show } from "solid-js";
import ArrowIconBorder from "../../assets/icon-arrow-border";
import XIcon from "../../assets/icon-x-border";
import { currentCurrency } from "~/utils/store";

function Item(props: any) {
  let itemRef: any;

  const [imageNumber, setImageNumber] = createSignal(0);
  const images = [
    "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGhvdXNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mzh8fGhvdXNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGhvdXNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    "https://www.shutterstock.com/image-photo/wide-angle-panorama-autumn-forestmisty-260nw-1195159864.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/0f/Eiffel_Tower_Vertical.JPG",
    "https://images.unsplash.com/photo-1503818454-2a008dc38d43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dGFsbHxlbnwwfHwwfHw%3D&w=1000&q=80",
    "https://images.unsplash.com/photo-1547039996-61c1135690c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2589&q=80",
  ];

  function updateImageNumber(numberToAdd: number) {
    let newImageNumber = imageNumber() + numberToAdd;
    if (newImageNumber > images.length - 1) setImageNumber(0);
    else if (newImageNumber < 0) setImageNumber(images.length - 1);
    else setImageNumber(newImageNumber);
  }

  return (
    <div
      ref={itemRef}
      class={`list-item`}
      id={
        props.selectedItem() && props.selectedItem().Id === props.item.Id
          ? props.isFocused()
            ? "focused-list-item"
            : "selected-list-item"
          : ""
      }
      onMouseDown={() => {
        if (props.selectedItem() && props.selectedItem().Id === props.item.Id) {
          props.setIsFocused(true);
        }
        props.setSelectedItem(props.item);
      }}
      onMouseEnter={() => {
        props.setHighlightedItemLngLat([props.item.Lng, props.item.Lat]);
      }}
      onMouseLeave={() => {
        props.setHighlightedItemLngLat(null);
      }}
    >
      <div class="icon-arrow-border-parent">
        <Show
          when={
            props.selectedItem() &&
            props.selectedItem().Id === props.item.Id &&
            props.isFocused()
          }
        >
          <div
            class="icon-x-border"
            onMouseDown={() => props.setIsFocused(false)}
          >
            <XIcon />
          </div>
        </Show>
        <div
          class="icon-arrow-border rotated-arrow"
          onMouseDown={(event) => {
            event.stopPropagation();
            updateImageNumber(-1);
          }}
        >
          <ArrowIconBorder />
        </div>
        <div
          class="icon-arrow-border"
          onMouseDown={(event) => {
            event.stopPropagation();
            updateImageNumber(1);
          }}
        >
          <ArrowIconBorder />
        </div>
      </div>
      <img
        src={images[imageNumber()]}
        class="unselectable"
        alt=""
        onMouseDown={() => {
          if (
            props.selectedItem() &&
            props.selectedItem().Id === props.item.Id
          ) {
            props.setIsFocused(true);
          }
          props.setSelectedItem(props.item);
        }}
      />
      <span
        class="description unselectable"
        onMouseDown={(event) => {
          if (props.selectedItem() && props.selectedItem().Id === props.item.Id)
            event.stopPropagation();
        }}
      >
        <div>{props.item.City}</div>
        <div>
          {Math.round(
            currentCurrency()
              ? props.item.EuroPrice * Number(currentCurrency()?.[3])
              : props.item.OriginalPrice
          ).toLocaleString()}{" "}
          {currentCurrency()?.[2] ?? props.item.CurrencySymbol}{" "}
        </div>
        <Show when={props.displayUnits() === "m"}>
          <div>
            {props.item.Size} m<sup>2</sup>
          </div>
        </Show>
        <Show when={props.displayUnits() === "ft"}>
          <div>
            {Math.round(props.item.Size * 10.76) + " ft"}
            <sup>2</sup>
          </div>
        </Show>
        <Show
          when={
            props.selectedItem() &&
            props.selectedItem().Id === props.item.Id &&
            props.itemDetails()
          }
        >
          <div class="list-item-body">
            <span>Bed: {props.itemDetails().Bed}</span>
            <span>Bath: {props.itemDetails().Bath}</span>
            <div>bla</div>
          </div>
        </Show>
      </span>
    </div>
  );
}

export default Item;
