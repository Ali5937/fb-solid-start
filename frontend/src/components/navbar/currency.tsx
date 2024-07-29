import { For, Show, Suspense, createEffect, createSignal } from "solid-js";

export default function Currency(props: any) {
  let selection = props.isAddItem ? 0 : 1;
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

  const [currencySelection, setCurrencySelection] = createSignal(selection);

  function changeCurrency(value: any) {
    props.setCurrentCurrency(value);
  }

  async function getCurrencies() {
    const currencies = await fetch(`${props.baseUrl}/currency`).then((res) =>
      res.json()
    );
    props.setCurrencyData(currencies);
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
        <Show when={!props.isAddItem}>
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
        </Show>
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
      <div class="separation"></div>
      <Suspense>
        <Show when={props.currencyData()}>
          <div class="other-currencies">
            <label for="other-currencies-list">Other Currencies</label>
            <select
              class="button-style"
              id="other-currencies-list"
              onChange={(e) => {
                const val = e.currentTarget?.value;
                if (val === "") {
                  changeCurrency(null);
                  setCurrencySelection(1);
                } else {
                  changeCurrency(val.split(","));
                  setCurrencySelection(0);
                }
              }}
            >
              <option value="" onClick={() => setCurrencySelection(1)}>
                Choose Currency
              </option>
              {Object.keys(props.currencyData()).map((key) => {
                const currency = props.currencyData()[key];
                return <option value={currency}>{currency[1]}</option>;
              })}
            </select>
          </div>
        </Show>
      </Suspense>
      <div class="separation"></div>
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
