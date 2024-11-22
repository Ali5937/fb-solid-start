export default function allCurrencies(props: any) {
  return (
    <div class="all-currencies">
      <label for="all-currencies-list">{props.currencyText}</label>
      <select
        class="button-style"
        id="all-currencies-list"
        value={props.currentCurrency() || ""}
        onChange={(e) => {
          const val = e.currentTarget?.value;
          if (val === "") {
            props.setCurrentCurrency(null);
          } else {
            props.setCurrentCurrency(val.split(","));
          }
        }}
      >
        <option value="">Choose Currency</option>
        {Object.keys(props.currencyData()).map((key) => {
          const currency = props.currencyData()[key];
          return <option value={currency}>{currency[1]}</option>;
        })}
      </select>
    </div>
  );
}
