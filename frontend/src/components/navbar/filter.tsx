import DualSlider from "./dualSlider";
import FilterType from "./filterType";

export default function Filter(props: any) {
  return (
    <div
      class="dropdown-element-left button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <FilterType
        saleType={props.saleType}
        setSaleType={props.setSaleType}
        itemType={props.itemType}
        setItemType={props.setItemType}
      />
      <div class="separation"></div>
      <div class="slider-container">
        <DualSlider
          rentMax={props.rentMax}
          buyMax={props.buyMax}
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
