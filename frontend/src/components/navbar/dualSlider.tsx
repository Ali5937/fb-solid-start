import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import noUiSlider from "nouislider";
import "./dualSlider.css";

export default function DualSlider(props: any) {
  const [maxValue, setMaxValue] = createSignal<number>(0);
  const exponent = 0.5;
  let sliderInstance: any = null;

  let oldSliderValues: [number, number] = [0, maxValue()];
  if (props.saleType() === "rent") {
    oldSliderValues = props.rentPriceRange();
  } else if (props.saleType() === "buy") {
    oldSliderValues = props.buyPriceRange();
  }

  const [sliderValues, setSliderValues] = createSignal<[number, number]>([
    oldSliderValues[0] || 0,
    oldSliderValues[1] || maxValue(),
  ]);

  const logLikeScale = (value: number) => {
    const scaledValue = Math.pow(value / maxValue(), exponent) * maxValue();
    return scaledValue;
  };

  setSliderValues(oldSliderValues);
  if (sliderInstance) {
    sliderInstance.set([
      logLikeScale(oldSliderValues[0]),
      logLikeScale(oldSliderValues[1]),
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
            max: maxValue(),
          },
          step: 1,
          connect: true,
        });

        sliderInstance.on("update", (values: any) => {
          const newValues = values.map((value: any) =>
            Math.round(inverseLogLikeScale(parseFloat(value)))
          ) as [number, number];
          setSliderValues(newValues);
        });

        sliderInstance.on("change", () => {
          if (props.saleType() === "buy") {
            props.setBuyPriceRange(sliderValues());
          } else if (props.saleType() === "rent") {
            props.setRentPriceRange(sliderValues());
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
    if (props.saleType() === "rent") {
      setMaxValue(props.rentMax);
    } else if (props.saleType() === "buy") {
      setMaxValue(props.buyMax);
    }

    if (sliderInstance) {
      sliderInstance.updateOptions({
        range: {
          min: 0,
          max: maxValue(),
        },
      });
    }
  });

  createEffect(() => {
    // console.log(props.rentPriceRange());
  });

  return (
    <div class="slider-parent">
      <div id="slider" ref={sliderRef}></div>
      <div class="price-slider-label">
        Price:{" "}
        {Math.round(
          sliderValues()[0] * props.currentCurrency()[3]
        ).toLocaleString()}{" "}
        -{" "}
        {Math.round(
          sliderValues()[1] * props.currentCurrency()[3]
        ).toLocaleString()}{" "}
        <span>
          {props.currentCurrency() ? props.currentCurrency()[2] : "€"}
        </span>
      </div>
    </div>
  );
}
