import {
  createAsync,
  useNavigate,
  useParams,
  useSearchParams,
} from "@solidjs/router";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import {
  Show,
  Suspense,
  createEffect,
  createSignal,
  lazy,
  onMount,
} from "solid-js";
import { isServer } from "solid-js/web";
import Cookies from "js-cookie";
import List from "~/components/list/list";
import Navbar from "~/components/navbar/navbar";
import GetItemType from "~/utils/GetItemType";
import GetInitialMapArea from "~/utils/GetInitialMapArea";
import { clientOnly } from "@solidjs/start";
import { getRequestEvent } from "solid-js/web";
import { isbot } from "isbot";
import IconArrow from "~/assets/icon-arrow";

const Account = lazy(() => import("~/components/account/account"));
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
  ).then((res) => res.json());
  return response;
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
  const [windowWidth, setWindowWidth] = createSignal<number>(
    isServer ? 0 : window.innerWidth
  );

  const [windowHeight, setWindowHeight] = createSignal<number>(
    isServer ? 0 : window.innerHeight
  );

  const [canUseCookies, setCanUseCookies] = createSignal<boolean>(
    Cookies.get("canUseCookies") ? true : false
  );
  const [theme, setTheme] = createSignal<string>(
    Cookies.get("theme") || "dark-theme"
  );

  const [isLoggedIn, setIsLoggedIn] = createSignal<boolean>(false);
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
  const [isPanelOpen, setIsPanelOpen] = createSignal<boolean>(true);
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
  const [openDropdownNumber, setOpenDropdownNumber] = createSignal<number>(0);
  const [isProfileOpen, setIsProfileOpen] = createSignal<boolean>(false);

  const defaultCountry = "All Countries";
  const defaultState = "All States";
  const [states, setStates] = createSignal([]);
  const [selectedState, setSelectedState] = createSignal("");
  const [countries, setCountries] = createSignal<string[]>([""]);
  const [selectedCountry, setSelectedCountry] = createSignal("");
  const [originalCountries, setOriginalCountries] = createSignal<string[]>([
    "",
  ]);

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
  let isCrawler = isbot(event?.request.headers.get("User-Agent"));
  if (isCrawler) {
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

  if (!isServer) {
    window.addEventListener("resize", () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    });
  }

  async function checkIfLoggedIn() {
    const result = await fetch(`${baseUrl}/profile/check-logged-in`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json());

    if (result.message === "authorized") setIsLoggedIn(true);
    else setIsLoggedIn(false);
  }

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

  onMount(() => {
    checkIfLoggedIn();
  });

  //Old: http://localhost:3000/#/buy/house/0/1000000/13.3629/47.601/4/
  //New: http://localhost:3000/user-region/buy/house?region="example"&id="example"
  //user-region = "us" for usa or "all" for anything else
  ///region(optional) = "germany-bavaria-munich"
  //id(optional) = "593475"

  return (
    <MetaProvider>
      <Title>Solid App</Title>
      <Meta name="description" content={`${saleType()} ${itemType()}`}></Meta>
      {/* CHORE: In description(Meta tag) ad location of country/region/city if searched by it */}
      <Link rel="dns-prefetch" href="https://tiles.stadiamaps.com"></Link>
      <div
        id="app"
        class={`${theme()} ${
          windowWidth() > windowHeight() ? "landscape-mode" : ""
        }`}
      >
        <Navbar
          baseUrl={baseUrl}
          defaultCountry={defaultCountry}
          defaultState={defaultState}
          theme={theme}
          setTheme={setTheme}
          openDropdownNumber={openDropdownNumber}
          setOpenDropdownNumber={setOpenDropdownNumber}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          isPanelOpen={setIsPanelOpen}
          setIsPanelOpen={setIsPanelOpen}
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
          states={states}
          setStates={setStates}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          countries={countries}
          setCountries={setCountries}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
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
            isPanelOpen={isPanelOpen}
            setIsPanelOpen={setIsPanelOpen}
            initialSelectedId={initialSelectedId}
            selectedState={selectedState}
            selectedCountry={selectedCountry}
          />
          <div
            class={`panel ${
              isPanelOpen() || windowWidth() >= 1024 ? "is-open" : ""
            }`}
          >
            <button
              class={`list-switch`}
              onMouseDown={() => {
                if (isProfileOpen()) setIsProfileOpen(false);
                else setIsPanelOpen(!isPanelOpen());
              }}
            >
              {isPanelOpen() && !isProfileOpen() ? "Map" : "List"}
              <IconArrow />
            </button>
            <Suspense>
              <Show when={!isProfileOpen()}>
                <List
                  baseUrl={baseUrl}
                  isCrawler={isCrawler}
                  windowWidth={windowWidth}
                  windowHeight={windowHeight}
                  isPanelOpen={isPanelOpen}
                  setIsPanelOpen={setIsPanelOpen}
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
              </Show>
            </Suspense>
            <Suspense>
              <Show when={isProfileOpen()}>
                <Account
                  baseUrl={baseUrl}
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                />
              </Show>
            </Suspense>
          </div>
        </main>
      </div>
    </MetaProvider>
  );
}
