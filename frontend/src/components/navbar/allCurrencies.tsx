import { currencyData, setCurrentCurrency } from "~/utils/store";

export default function allCurrencies(props: any) {
  return (
    <div class="all-currencies">
      <label for="all-currencies-list">{props.currencyText}</label>
      <select
        class="button-style"
        id="all-currencies-list"
        value={""}
        onChange={(e) => {
          const currCode = e.currentTarget?.value;
          if (currCode && currencyData()) {
            setCurrentCurrency(currencyData()[currCode]);
          } else {
            setCurrentCurrency(null);
          }
        }}
      >
        <option value="">Choose Currency</option>
        {Object.keys(currencyData()).map((key) => {
          const currency = currencyData()[key];
          return <option value={currency.code}>{currency.name}</option>;
        })}
      </select>
    </div>
  );
}
