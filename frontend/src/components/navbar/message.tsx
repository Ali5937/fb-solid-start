export default function Message(props: any) {
  return (
    <div
      class="dropdown-element-right button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      Message Test
    </div>
  );
}
