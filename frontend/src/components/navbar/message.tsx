export default function Message(props: any) {
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
      Message Test
    </div>
  );
}
