import { For, Show, Suspense, createEffect, createSignal } from "solid-js";
import AllCurrencies from "./allCurrencies";
import { currentCurrency, setCurrentCurrency } from "~/utils/store";

export default function Currency(props: any) {
  return (
    <div
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div class="currency-button-parent">
        <Show when={!props.isAddItem}>
          <button
            class={`currency-button ${!currentCurrency() ? "highlighted" : ""}`}
            onMouseDown={() => {
              setCurrentCurrency(null);
            }}
          >
            <sup>$</sup>⁄<sub>€</sub>
          </button>
        </Show>
        <button
          class={`currency-button ${
            currentCurrency()?.[0] === "USD" ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            setCurrentCurrency(props.currencyData().USD);
          }}
        >
          $
          <Show when={props.currencyData()}>
            <div class="currency-code">{props.currencyData().USD[0]}</div>
          </Show>
        </button>
        <button
          class={`currency-button ${
            currentCurrency()?.[0] === "EUR" ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            setCurrentCurrency(props.currencyData().EUR);
          }}
        >
          €
          <Show when={props.currencyData()}>
            <div class="currency-code">{props.currencyData().EUR[0]}</div>
          </Show>
        </button>
        <button
          class={`currency-button ${
            currentCurrency()?.[0] === "GBP" ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            setCurrentCurrency(props.currencyData().GBP);
          }}
        >
          £
          <Show when={props.currencyData()}>
            <div class="currency-code">{props.currencyData().GBP[0]}</div>
          </Show>
        </button>
      </div>
      <div class="separation"></div>
      <Suspense>
        <Show when={props.currencyData()}>
          <AllCurrencies
            currencyText={"Other Currencies"}
            currencyData={props.currencyData}
          />
        </Show>
      </Suspense>
    </div>
  );
}
