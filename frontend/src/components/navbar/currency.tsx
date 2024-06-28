import { Show, createSignal } from "solid-js";
import IconArrow from "~/assets/icon-arrow";

export default function Currency(props: any) {
  let selection = 1;
  if (props.currentCurrency()) {
    if (props.currentCurrency()[0] === "USD") {
      selection = 2;
    } else if (props.currentCurrency()[0] === "EUR") {
      selection = 3;
    } else if (props.currentCurrency()[0] === "GBP") {
      selection = 4;
    } else {
      selection = 0;
    }
  }

  const [showOtherCurrencies, setShowOtherCurrencies] = createSignal(false);
  const [currencySelection, setCurrencySelection] = createSignal(selection);

  function changeCurrency(value: any) {
    props.setCurrentCurrency(value);
    setCurrencySelection(0);
  }

  async function getCurrencies() {
    const currencyFile = await fetch(`${props.baseUrl}/currency`);
    const data = await currencyFile.json();
    props.setCurrencyData(data);
  }

  if (!props.currencyData()) getCurrencies();

  return (
    <div
      class="dropdown-element-right button-style"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    >
      <div class="currency-button-parent">
        <button
          class={`currency-button ${
            currencySelection() === 1 ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            changeCurrency(null);
            setCurrencySelection(1);
          }}
        >
          <sup>$</sup>⁄<sub>€</sub>
        </button>
        <button
          class={`currency-button ${
            currencySelection() === 2 ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            changeCurrency(props.currencyData().USD);
            setCurrencySelection(2);
          }}
        >
          ${" "}
          <Show when={props.currencyData()}>
            <div class="currency-code">{props.currencyData().USD[0]}</div>
          </Show>
        </button>
        <button
          class={`currency-button ${
            currencySelection() === 3 ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            changeCurrency(props.currencyData().EUR);
            setCurrencySelection(3);
          }}
        >
          €{" "}
          <Show when={props.currencyData()}>
            <div class="currency-code">{props.currencyData().EUR[0]}</div>
          </Show>
        </button>
        <button
          class={`currency-button ${
            currencySelection() === 4 ? "highlighted" : ""
          }`}
          onMouseDown={() => {
            changeCurrency(props.currencyData().GBP);
            setCurrencySelection(4);
          }}
        >
          £{" "}
          <Show when={props.currencyData()}>
            <div class="currency-code">{props.currencyData().GBP[0]}</div>
          </Show>
        </button>
      </div>
      <div
        class="other-currency-dropdown"
        onMouseDown={() => {
          setShowOtherCurrencies(!showOtherCurrencies());
        }}
      >
        <button
          class={`other-currency-dropdown-button ${
            showOtherCurrencies() ? "is-clicked" : ""
          }`}
        >
          <div>
            {props.currentCurrency()
              ? props.currentCurrency()[1]
              : "Original Currency"}
          </div>
          <IconArrow />
        </button>
        <div class="other-currency-list">
          <Show when={showOtherCurrencies()}>
            {Object.keys(props.currencyData()).map((key) => {
              const value = props.currencyData()[key];
              return (
                <div
                  onMouseDown={() => {
                    changeCurrency(value);
                  }}
                >
                  {value[1]}
                </div>
              );
            })}
          </Show>
        </div>
      </div>
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
