import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import {
  rentPriceRange,
  setRentPriceRange,
  buyPriceRange,
  setBuyPriceRange,
  rentMax,
  buyMax,
  saleType,
  currentCurrency,
} from "~/utils/store";
import noUiSlider from "nouislider";
import "./dualSlider.css";

export default function DualSlider(props: any) {
  const [maxValue, setMaxValue] = createSignal<number>(0);
  updateMaxValue();
  const exponent = 0.5;
  let sliderInstance: any = null;

  let oldSliderValues: [number, number] = [0, maxValue()];
  if (saleType() === "rent") {
    oldSliderValues = rentPriceRange();
  } else if (saleType() === "buy") {
    oldSliderValues = buyPriceRange();
  }

  const [sliderValues, setSliderValues] = createSignal<[number, number]>([
    oldSliderValues[0] || 0,
    oldSliderValues[1] || maxValue(),
  ]);

  const logLikeScale = (value: number) => {
    const scaledValue = Math.pow(value / maxValue(), exponent) * maxValue();
    return scaledValue;
  };

  if (sliderInstance) {
    sliderInstance.set([
      logLikeScale(sliderValues()[0]),
      logLikeScale(sliderValues()[1]),
    ]);
  }

  const inverseLogLikeScale = (value: number) => {
    const scaledValue = Math.pow(value / maxValue(), 1 / exponent) * maxValue();
    return Math.round(scaledValue);
  };

  const sliderRef = (element: HTMLElement | null) => {
    if (element) {
      onMount(() => {
        sliderInstance = noUiSlider.create(element, {
          start: sliderValues().map((value) => logLikeScale(value)),
          range: {
            min: 0,
            max: maxValue() - 1,
          },
          step: 1,
          connect: true,
        });

        sliderInstance.on("update", (values: any) => {
          const newValues = values.map((value: any) =>
            inverseLogLikeScale(parseFloat(value))
          ) as [number, number];
          setSliderValues(newValues);
        });

        sliderInstance.on("change", () => {
          if (saleType() === "buy") {
            setBuyPriceRange(sliderValues());
          } else if (saleType() === "rent") {
            setRentPriceRange(sliderValues());
          }
        });
      });

      onCleanup(() => {
        if (sliderInstance) {
          sliderInstance.destroy();
        }
      });
    }
  };

  createEffect(() => {
    updateMaxValue();
    if (sliderInstance) {
      sliderInstance.updateOptions({
        range: {
          min: 0,
          max: maxValue() - 1,
        },
      });
      untrack(() => {
        if (saleType() === "rent") {
          setSliderValues(rentPriceRange());
        } else if (saleType() === "buy") {
          setSliderValues(buyPriceRange());
        }
        sliderInstance.set([
          logLikeScale(sliderValues()[0]),
          logLikeScale(sliderValues()[1]),
        ]);
      });
    }
  });

  createEffect(() => {
    if (sliderInstance) {
      if (saleType() === "rent") {
        setSliderValues([rentPriceRange()[0], rentPriceRange()[1]]);
      } else if (saleType() === "buy") {
        setSliderValues([buyPriceRange()[0], buyPriceRange()[1]]);
        sliderInstance.set([
          logLikeScale(sliderValues()[0]),
          logLikeScale(sliderValues()[1]),
        ]);
      }
    }
  });

  function updateMaxValue() {
    if (saleType() === "rent") {
      setMaxValue(rentMax);
    } else if (saleType() === "buy") {
      setMaxValue(buyMax);
    }
  }

  return (
    <div class="slider-parent">
      <div id="slider" ref={sliderRef}></div>
      <div class="price-slider-label">
        Price:{" "}
        {Math.round(
          sliderValues()[0] * Number(currentCurrency()?.exchangeRate || 1)
        ).toLocaleString()}{" "}
        -{" "}
        {Math.round(
          sliderValues()[1] * Number(currentCurrency()?.exchangeRate || 1)
        ).toLocaleString()}{" "}
        <span>{currentCurrency()?.symbol ?? "€"}</span>
      </div>
    </div>
  );
}
