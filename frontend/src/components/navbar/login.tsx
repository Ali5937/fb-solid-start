export default function Login(props: any) {
  return (
    <div
      class="dropdown-element-right button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      Login Test
    </div>
  );
}
