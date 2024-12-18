import {
  createAsync,
  useLocation,
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
import {
  rentPriceRange,
  buyPriceRange,
  delimiter,
  saleType,
  itemType,
  setSaleType,
  setItemType,
  setCurrencyData,
  saleObj,
  itemObj,
  baseUrl,
  theme,
} from "~/utils/store";
import { isServer } from "solid-js/web";
import Cookies from "js-cookie";
import List from "~/components/list/list";
import Navbar from "~/components/navbar/navbar";
import GetInitialMapArea from "~/utils/GetInitialMapArea";
import { clientOnly } from "@solidjs/start";
import { getRequestEvent } from "solid-js/web";
import { isbot } from "isbot";
import { GetItemType } from "~/utils/SearchItems";
import IconArrow from "~/assets/icon-arrow";

const Account = lazy(() => import("~/components/account/account"));
const Map = clientOnly(() => import("../components/map/map"));

const getSSRData = async (
  saleType: string,
  itemType: string,
  min: string,
  max: string,
  polygon: string,
  polygon2: string,
  itemSort: string
) => {
  "use server";
  const type = GetItemType(null, saleType, itemType);

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
  return response.data;
};

export default function Index() {
  const urlParams = { ...useParams() }.index.split("/");
  if (urlParams.length >= 2) {
    setSaleType(urlParams[0]);
    setItemType(urlParams[1]);
  } else {
    setSaleType(saleObj.rent);
    setItemType(itemObj.apartment);
  }

  const [searchParams, setSearchParams] = useSearchParams();
  let oldUserRegion: string = "";
  let oldRegion: string = "";
  let oldId: string = "";
  let oldLng: number = 13.362;
  let oldLat: number = 47.601;
  let oldZoom: number = 3.9;
  let initialSelectedId: number = 0;

  const expires = 365;
  const [windowWidth, setWindowWidth] = createSignal<number>(0);
  const [windowHeight, setWindowHeight] = createSignal<number>(0);
  const [canUseCookies, setCanUseCookies] = createSignal<boolean>(
    Cookies.get("canUseCookies") ? true : false
  );

  const [isLoggedIn, setIsLoggedIn] = createSignal<boolean>(false);

  const [itemId, setItemId] = createSignal<string>(oldId.toString() || "");
  // const [userId, setUserId] = createSignal<string>();

  const [lowestPrice, setLowestPrice] = createSignal<number>();
  const [highestPrice, setHighestPrice] = createSignal<number>();
  const [moveMapCoordinates, setMoveMapCoordinates] = createSignal<{
    lng1: number;
    lat1: number;
    lng2: number;
    lat2: number;
  }>();
  const [markers, setMarkers] = createSignal<any>();
  const [mapLocation, setMapLocation] = createSignal<[number, number, number]>([
    oldLng,
    oldLat,
    oldZoom,
  ]);
  const [isPanelOpen, setIsPanelOpen] = createSignal<boolean>(true);
  const [accountPage, setAccountPage] = createSignal<string>("account");
  const [displayUnits, setDisplayUnits] = createSignal(
    Cookies.get("displayUnits") || "m"
  );
  const [propertyItems, setPropertyItems] = createSignal(null);
  const [itemSort, setItemSort] = createSignal("low");
  const [selectedItem, setSelectedItem] = createSignal(null);
  const [highlightedItemLngLat, setHighlightedItemLngLat] = createSignal("");
  const [openDropdownNumber, setOpenDropdownNumber] = createSignal<number>(0);
  const [isProfileOpen, setIsProfileOpen] = createSignal<boolean>(false);
  const [countries, setCountries] = createSignal<string[]>([""]);
  const [states, setStates] = createSignal([]);
  const [selectedCountry, setSelectedCountry] = createSignal<string>("");
  const [selectedState, setSelectedState] = createSignal<string>("");
  const [selectedCity, setSelectedCity] = createSignal<string>("");

  // let polygonString1: string = searchParams.poly;
  // let polygonString2: string = searchParams.poly2 ?? "";
  let polygonString1: string = "";
  let polygonString2: string = "";

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
  // maybe issue (crawler sees slightly different result than user)
  let isCrawler = isbot(event?.request.headers.get("User-Agent"));
  // isCrawler = !isCrawler; //check ssr
  if (isCrawler) {
    setPropertyItems(
      createAsync(
        () =>
          getSSRData(
            saleType(),
            itemType(),
            min.toString(),
            max.toString(),
            polygonString1, //later
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

  function clickListSwitch() {
    if (isProfileOpen()) {
      if (accountPage() === "account") {
        setIsProfileOpen(false);
      } else if (accountPage() === "items" || accountPage() === "messages") {
        setAccountPage("account");
      } else if (accountPage() === "addItem") {
        setAccountPage("items");
      } else if (accountPage() === "addImages") {
        setAccountPage("addItem");
      }
    } else {
      setIsPanelOpen(!isPanelOpen());
    }
  }

  async function getCurrencies() {
    const currencies = await fetch(`${baseUrl}/currencies`).then((res) =>
      res.json()
    );
    setCurrencyData(currencies.data);
  }

  createEffect(() => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    if (selectedCountry()) {
      params.set("country", selectedCountry());
      if (selectedState()) {
        params.set("state", selectedState());
        if (selectedCity()) {
          params.set("city", selectedCity());
        }
      }
    }
    if (itemId()) {
      params.set("id", itemId());
    }

    let newUrl = `/${saleType()}/${itemType()}`;
    if (params.size > 0) {
      newUrl += `/?${params.toString()}`;
    }

    const navigate = useNavigate();
    navigate(newUrl, { replace: true });

    setSearchParams({
      country: selectedCountry(),
      state: selectedState(),
      city: selectedCity(),
      // poly: polygonString1,
      // poly2: searchParams.poly2 ?? "",
    });
  });

  onMount(() => {
    if (!isServer) {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
      checkIfLoggedIn();
      getCurrencies();
    }
  });

  createEffect(() => {
    Cookies.set("rentPriceRange", rentPriceRange().join(delimiter));
  });
  createEffect(() => {
    Cookies.set("buyPriceRange", buyPriceRange().join(delimiter));
  });

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
          openDropdownNumber={openDropdownNumber}
          setOpenDropdownNumber={setOpenDropdownNumber}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          isPanelOpen={setIsPanelOpen}
          setIsPanelOpen={setIsPanelOpen}
          setMoveMapCoordinates={setMoveMapCoordinates}
          markers={markers}
          setMarkers={setMarkers}
          lowestPrice={lowestPrice}
          setLowestPrice={setLowestPrice}
          highestPrice={highestPrice}
          setHighestPrice={setHighestPrice}
          displayUnits={displayUnits}
          setDisplayUnits={setDisplayUnits}
          propertyItems={propertyItems}
          setPropertyItems={setPropertyItems}
          itemSort={itemSort}
          countries={countries}
          setCountries={setCountries}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          states={states}
          setStates={setStates}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
        />
        <main>
          <Map
            lowestPrice={lowestPrice}
            setLowestPrice={setLowestPrice}
            highestPrice={highestPrice}
            setHighestPrice={setHighestPrice}
            moveMapCoordinates={moveMapCoordinates}
            setMoveMapCoordinates={setMoveMapCoordinates}
            mapLocation={mapLocation}
            setMapLocation={setMapLocation}
            displayUnits={displayUnits}
            markers={markers}
            setMarkers={setMarkers}
            propertyItems={propertyItems}
            setPropertyItems={setPropertyItems}
            itemSort={itemSort}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            highlightedItemLngLat={highlightedItemLngLat}
            isPanelOpen={isPanelOpen}
            setIsPanelOpen={setIsPanelOpen}
            initialSelectedId={initialSelectedId}
            selectedCountry={selectedCountry}
            selectedState={selectedState}
            selectedCity={selectedCity}
          />
          <div
            class={`panel ${
              isPanelOpen() || windowWidth() >= 1024 ? "is-open" : ""
            }`}
            onMouseDown={() => {
              setOpenDropdownNumber(0);
            }}
          >
            <button
              class={`list-switch ${
                !isProfileOpen() &&
                (windowWidth() === 0 || windowWidth() >= 1024)
                  ? "hidden"
                  : ""
              }`}
              onMouseDown={clickListSwitch}
            >
              {isPanelOpen() && !isProfileOpen()
                ? "Map"
                : isPanelOpen() && accountPage() !== "account"
                ? "Back"
                : "List"}
              <IconArrow />
            </button>
            <Suspense>
              <Show when={!isProfileOpen()}>
                <List
                  isCrawler={isCrawler}
                  windowWidth={windowWidth}
                  windowHeight={windowHeight}
                  isPanelOpen={isPanelOpen}
                  setIsPanelOpen={setIsPanelOpen}
                  propertyItems={propertyItems}
                  setPropertyItems={setPropertyItems}
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
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  accountPage={accountPage}
                  setAccountPage={setAccountPage}
                  windowWidth={windowWidth}
                  windowHeight={windowHeight}
                  setOpenDropdownNumber={setOpenDropdownNumber}
                  setMoveMapCoordinates={setMoveMapCoordinates}
                  markers={markers}
                  setMarkers={setMarkers}
                  lowestPrice={lowestPrice}
                  setLowestPrice={setLowestPrice}
                  highestPrice={highestPrice}
                  setHighestPrice={setHighestPrice}
                  displayUnits={displayUnits}
                  states={states}
                  setStates={setStates}
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  propertyItems={propertyItems}
                  setPropertyItems={setPropertyItems}
                  itemSort={itemSort}
                  countries={countries}
                  setCountries={setCountries}
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                />
              </Show>
            </Suspense>
          </div>
        </main>
      </div>
    </MetaProvider>
  );
}
