import IconArrow from "~/assets/icon-arrow";

export default function Pagination(props: any) {
  return (
    <div class="pagination">
      <button
        class={`${props.currentNumber() === 1 ? "hidden" : ""}`}
        onMouseDown={() =>
          props.setCurrentNumber((c: number) => (c > 1 ? c - 1 : c))
        }
      >
        <IconArrow />
      </button>
      <div class="display-numbers">
        {props.currentNumber()}/{props.totalNumber}
      </div>
      <button
        class={`${props.currentNumber() === props.totalNumber ? "hidden" : ""}`}
        onMouseDown={() =>
          props.setCurrentNumber((c: number) =>
            c < props.totalNumber ? c + 1 : c
          )
        }
      >
        <IconArrow />
      </button>
    </div>
  );
}
