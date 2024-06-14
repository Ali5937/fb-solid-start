export default function Login(props: any) {
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
      Login Test
    </div>
  );
}
