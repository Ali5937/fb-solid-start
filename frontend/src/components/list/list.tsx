import { For } from "solid-js";

export default function List(props: any) {
  return (
    <For each={props.initialItems}>
      {(item: any, index: any) => <div>{item.currency_symbol}</div>}
    </For>
  );
}
