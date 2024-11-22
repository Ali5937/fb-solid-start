export default function Units(props: any) {
  return (
    <div class="units-parent">
      <div class="unit-label">Units</div>
      <div class="units">
        <button
          class={props.displayUnits() === "m" ? "highlighted" : ""}
          onMouseDown={() => {
            props.setDisplayUnits("m");
          }}
        >
          Meter
        </button>
        <button
          class={props.displayUnits() === "ft" ? "highlighted" : ""}
          onMouseDown={() => {
            props.setDisplayUnits("ft");
          }}
        >
          Feet
        </button>
      </div>
    </div>
  );
}
