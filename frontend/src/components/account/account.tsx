export default function Account(props: any) {
  return (
    <div
      class="account button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      Login Test
    </div>
  );
}
