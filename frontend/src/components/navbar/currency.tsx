export default function Currency(props: any) {
  return (
    <div
      class="dropdown-element-right button-style"
      onmousedown={(event) => {
        event.stopPropagation();
      }}
      onclick={(event) => {
        event.stopPropagation();
      }}
    >
      Currency Test
    </div>
  );
}
