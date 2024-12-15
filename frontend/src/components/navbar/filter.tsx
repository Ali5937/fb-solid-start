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
      <FilterType />
      <div class="separation"></div>
      <div class="slider-container">
        <DualSlider />
      </div>
    </div>
  );
}
