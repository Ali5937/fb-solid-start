import {
  createAsync,
  useNavigate,
  useParams,
  useSearchParams,
} from "@solidjs/router";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { createEffect, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import Cookies from "js-cookie";
import List from "~/components/list/list";
import Navbar from "~/components/navbar/navbar";
import GetItemType from "~/utils/GetItemType";
import GetInitialMapArea from "~/utils/GetInitialMapArea";
// import Map from "~/components/map/map";
import { clientOnly } from "@solidjs/start";
import { getRequestEvent } from "solid-js/web";
import { isbot } from "isbot";

const Map = clientOnly(() => import("../components/map/map"));
const baseUrl = "http://localhost:5000/api";

const getData = async (
  saleType: string,
  itemType: string,
  min: string,
  max: string,
  polygon: string,
  polygon2: string,
  itemSort: string
) => {
  "use server";
  const type = GetItemType(saleType, itemType, polygon, polygon2);
  const response = await fetch(
    `${baseUrl}/items?` +
      new URLSearchParams({
        type: type.toString(),
        min,
        max,
        polygon,
        polygon2,
        itemSort,
      })
  );
  const res = await response.json();
  return res;
};

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentRentMax, setCurrentRentMax] = createSignal<number>(5000);
  const [currentBuyMax, setCurrentBuyMax] = createSignal<number>(1000000);
  let oldSaleType;
  let oldItemType;
  let oldRentPrice: [number, number] = [0, currentRentMax()];
  let oldBuyPrice: [number, number] = [0, currentBuyMax()];
  let oldLng: number = 0;
  let oldLat: number = 0;
  let oldZoom: number = 0;
  let initialSelectedId: number = 0;

  let oldRegion;
  let oldId: string = "";

  let currentC = Cookies.get("currentCurrency");
  let splitCurrentCurrency;
  let finalCurrentCurrency;

  if (currentC && currentC != "null") {
    splitCurrentCurrency = currentC.split(",");

    finalCurrentCurrency = [
      splitCurrentCurrency[0],
      splitCurrentCurrency[1],
      splitCurrentCurrency[splitCurrentCurrency.length - 2],
      Number(splitCurrentCurrency[splitCurrentCurrency.length - 1]),
    ];
  } else {
    finalCurrentCurrency = ["EUR", "Euro", "€", 1];
  }

  const urlParams = { ...useParams() }.index.split("/");
  // console.log(urlParams);
  oldSaleType = urlParams[0];
  oldItemType = urlParams[1];

  if (oldSaleType === "buy")
    oldRentPrice = [
      Number(urlParams[2]) || oldRentPrice[0],
      Number(urlParams[3]) || oldRentPrice[1],
    ];
  else
    oldBuyPrice = [
      Number(urlParams[2]) || oldBuyPrice[0],
      Number(urlParams[3]) || oldBuyPrice[1],
    ];

  const expires = 365;
  const [windowWidth, setWindowWidth] = createSignal<number | null>(
    isServer ? null : window.innerWidth
  );

  const [canUseCookies, setCanUseCookies] = createSignal<boolean>(
    Cookies.get("canUseCookies") ? true : false
  );
  const [theme, setTheme] = createSignal<string>(
    Cookies.get("theme") || "dark-theme"
  );

  const [userId, setUserId] = createSignal<number>(0);
  const [saleType, setSaleType] = createSignal<string>(oldSaleType || "rent"); // rent, buy
  const [itemType, setItemType] = createSignal<string>(
    oldItemType || "apartment"
  ); // apartment, house, shared, land
  const [region, setRegion] = createSignal<string>(oldRegion || "region");
  const [id, setId] = createSignal<string>(oldId.toString() || "id");
  const [rentPriceRange, setRentPriceRange] =
    createSignal<[number, number]>(oldRentPrice);
  const [buyPriceRange, setBuyPriceRange] =
    createSignal<[number, number]>(oldBuyPrice);
  const [mapLocation, setMapLocation] = createSignal<[number, number, number]>(
    oldLng ? [oldLng, oldLat, oldZoom] : [13.362, 47.601, 3.9]
  );
  const [isListOpen, setIsListOpen] = createSignal<boolean>(true);
  const [displayUnits, setDisplayUnits] = createSignal(
    Cookies.get("displayUnits") || "m"
  );
  const [currencyData, setCurrencyData] = createSignal(null);
  const [currentCurrency, setCurrentCurrency] =
    createSignal(finalCurrentCurrency);
  const [propertyItems, setPropertyItems] = createSignal(null);
  const [itemSort, setItemSort] = createSignal("new");
  const [selectedItem, setSelectedItem] = createSignal(null);
  const [highlightedItemLngLat, setHighlightedItemLngLat] = createSignal("");

  let polygonString1 = searchParams.poly;
  let polygonString2 = searchParams.poly2 ?? "";

  if (!polygonString1 || polygonString1 === "undefined") {
    polygonString1 = GetInitialMapArea(
      mapLocation()[0],
      mapLocation()[1],
      mapLocation()[2]
    );
  }

  const min = saleType() === "buy" ? buyPriceRange()[0] : rentPriceRange()[0];
  const max = saleType() === "buy" ? buyPriceRange()[1] : rentPriceRange()[1];

  const event = getRequestEvent();
  if (isbot(event?.request.headers.get("User-Agent"))) {
    setPropertyItems(
      createAsync(
        () =>
          getData(
            saleType(),
            itemType(),
            min.toString(),
            max.toString(),
            polygonString1,
            polygonString2,
            itemSort()
          ),
        { deferStream: true }
      )
    );
  }

  if (!isServer)
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));

  createEffect(() => {
    const newUrl = `/${saleType()}/${itemType()}${
      region() === "region" ? "" : `/${region()}`
    }${id() === "id" ? "" : `/${id()}`}`;

    const navigate = useNavigate();
    navigate(newUrl);

    setSearchParams({
      poly: polygonString1,
      poly2: searchParams.poly2 ?? "",
    });
  });

  //Old: http://localhost:3000/#/buy/house/0/1000000/13.3629/47.601/4/
  //New: http://localhost:3000/user-region/buy/house?region(optional)="example"&id(optional)="example"
  //user-region = "us" for usa or "all" for anything else
  ///region = "germany-bavaria-munich"
  //id = "593475"

  return (
    <MetaProvider>
      <Title>Solid App</Title>
      <Meta name="description" content={`${saleType()} ${itemType()}`}></Meta>
      {/* CHORE: In description(Meta tag) ad location of country/region/city if searched by it */}
      <Link rel="dns-prefetch" href="https://tiles.stadiamaps.com"></Link>
      <div id="app" class={`${theme()}`}>
        <Navbar
          baseUrl={baseUrl}
          theme={theme}
          setTheme={setTheme}
          userId={userId}
          setUserId={setUserId}
          saleType={saleType}
          setSaleType={setSaleType}
          itemType={itemType}
          setItemType={setItemType}
          currentRentMax={currentRentMax}
          currentBuyMax={currentBuyMax}
          rentPriceRange={rentPriceRange}
          setRentPriceRange={setRentPriceRange}
          buyPriceRange={buyPriceRange}
          setBuyPriceRange={setBuyPriceRange}
          currencyData={currencyData}
          setCurrencyData={setCurrencyData}
          currentCurrency={currentCurrency}
          setCurrentCurrency={setCurrentCurrency}
          displayUnits={displayUnits}
          setDisplayUnits={setDisplayUnits}
        />
        <main>
          <Map
            baseUrl={baseUrl}
            theme={theme}
            saleType={saleType}
            itemType={itemType}
            rentPriceRange={rentPriceRange}
            buyPriceRange={buyPriceRange}
            mapLocation={mapLocation}
            setMapLocation={setMapLocation}
            currentCurrency={currentCurrency}
            displayUnits={displayUnits}
            propertyItems={propertyItems}
            setPropertyItems={setPropertyItems}
            itemSort={itemSort}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            highlightedItemLngLat={highlightedItemLngLat}
            isListOpen={isListOpen}
            setIsListOpen={setIsListOpen}
            initialSelectedId={initialSelectedId}
          />
          <List
            baseUrl={baseUrl}
            isListOpen={isListOpen}
            windowWidth={windowWidth}
            setIsListOpen={setIsListOpen}
            propertyItems={propertyItems}
            setPropertyItems={setPropertyItems}
            currencyData={currencyData}
            currentCurrency={currentCurrency}
            displayUnits={displayUnits}
            itemSort={itemSort}
            setItemSort={setItemSort}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setHighlightedItemLngLat={setHighlightedItemLngLat}
            initialSelectedId={initialSelectedId}
          />
        </main>
      </div>
    </MetaProvider>
  );
}
