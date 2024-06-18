import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const currency = JSON.parse(fs.readFileSync("./currency.json", "utf8"));

const url = `http://api.exchangeratesapi.io/v1/latest?access_key=${process.env.CURRENCY_EXCHANGE_API}`;

fetch(url)
  .then((response) => response.json())
  .then((data: any) => {
    for (const key in currency) {
      if (data.rates.hasOwnProperty(key)) {
        currency[key][currency[key].length - 1] = parseFloat(data.rates[key].toFixed(2));
      }
    }
    const updatedCurrency = JSON.stringify(currency);
    fs.writeFile("../routes/updatedCurrency.json", updatedCurrency, (err) => {
      if (err) {
        console.error("An error occurred", err);
      } else {
        console.log("JSON data written to .json file successfully!");
      }
    });
  })
  .catch((error) => {
    console.error("An error occurred", error);
  });
