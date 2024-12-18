import {
  Suspense,
  Show,
  lazy,
  createSignal,
  For,
  onCleanup,
  createEffect,
  untrack,
} from "solid-js";
import IconArrow from "~/assets/icon-arrow";
import Cookies from "js-cookie";
import "./account.css";
import IconRotate from "~/assets/icon-rotate";
import Pagination from "./pagination";
import { baseUrl, currentCurrency } from "~/utils/store";
import { Currency } from "~/utils/interfaces";
const SearchBar = lazy(() => import("../navbar/searchBar"));
const Login = lazy(() => import("./login"));
const FilterType = lazy(() => import("../navbar/filterType"));
const AllCurrencies = lazy(() => import("../navbar/allCurrencies"));

export default function Account(props: any) {
  const [currentItems, setCurrentItems] = createSignal([]);
  const [itemPage, setItemPage] = createSignal<number>(1);
  const [itemPageCount, setItemPageCount] = createSignal<number>(0);
  const [selectedImage, setSelectedImage] = createSignal<string | null>(null);
  const [scaledImages, setScaledImages] = createSignal<(string | string[])[]>(
    []
  );
  const [cropperInstance, setCropperInstance] = createSignal<Cropper | null>(
    null
  );
  const [cropper, setCropper] = createSignal<Cropper>();
  let imageRef: HTMLImageElement | undefined;
  const [formData, setFormData] = createSignal();
  const [itemSaleType, setItemSaleType] = createSignal<string>("");
  const [itemItemType, setItemItemType] = createSignal<string>("");
  const [itemDisplayUnits, setItemDisplayUnits] = createSignal<string>(
    props.displayUnits() || "m"
  );
  const [itemCurrentCurrency, setItemCurrentCurrency] =
    createSignal<Currency | null>(currentCurrency());
  const totalNumber = 10;
  const [openFormNumber, setOpenFormNumber] = createSignal<number>(1);

  async function clickItemArrow(add: number) {
    if (
      (add === -1 && itemPage() > 1) ||
      (add === 1 && itemPage() < itemPageCount())
    ) {
      await getItems();
      setItemPage(itemPage() + add);
    }
  }

  async function getItems() {
    props.setAccountPage("items");
    const result = await fetch(`${baseUrl}/user/items/${itemPage()}`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json());
    setCurrentItems(result.data);
    setItemPageCount(result.count);
  }

  function addItem() {
    props.setAccountPage("addItem");
  }

  async function initializeCroppr(dataUrl: string) {
    if (!imageRef) return;
    setSelectedImage(dataUrl);
    if (cropper()) (cropper() as Cropper).destroy();
    const Cropper = (await import("cropperjs")).default;
    await import("cropperjs/dist/cropper.css");
    setCropper(
      new Cropper(imageRef, {
        aspectRatio: NaN,
        viewMode: 2,
        autoCropArea: 1,
        responsive: true,
        background: false,
      })
    );
    setCropperInstance(cropper() as Cropper);
  }

  function getCroppedDataUrl() {
    setScaledImages((images) =>
      images.map((img) => {
        const dataUrl = typeof img === "string" ? img : img[1];
        const originalDataUrl = typeof img === "string" ? img : img[0];
        const currentSelectedImage = selectedImage();
        if (
          cropper() &&
          currentSelectedImage &&
          currentSelectedImage === dataUrl
        ) {
          const croppedDataUrl = (cropper() as Cropper)
            .getCroppedCanvas()
            .toDataURL("image/jpeg");
          initializeCroppr(croppedDataUrl);
          return [originalDataUrl, croppedDataUrl];
        } else {
          return img;
        }
      })
    );
  }

  function undoCrop() {
    setScaledImages((images) =>
      images.map((img) => {
        if (Array.isArray(img) && img[1] === selectedImage()) {
          initializeCroppr(img[0]);
          return img[0];
        }
        return img;
      })
    );
  }

  function rotateImage() {
    if (cropper()) {
      cropper()?.rotate(90);
      const imgData = cropper()?.getContainerData();
      const width = imgData?.width as number;
      const height = imgData?.height as number;
      if (width > height) {
        cropper()?.setCanvasData({
          height: imgData?.height,
        });
      } else {
        cropper()?.setCanvasData({
          width: imgData?.width,
        });
      }
      cropper()?.setCropBoxData({
        width: imgData?.width,
        height: imgData?.height,
      });
    }
  }

  async function handleImageCropping(event: Event) {
    const maxImageSize = 1200;
    const imageQuality = 0.8;
    const target = event.target as HTMLInputElement;
    const files = target.files ? target.files : null;
    if (files) {
      const scaledImagesPromises = Array.from(files).map((file: File) => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result?.toString();
            if (dataUrl) {
              resizeDataUrl(dataUrl, maxImageSize, imageQuality)
                .then((scaledDataUrl: string) => {
                  setScaledImages([...scaledImages(), scaledDataUrl]);
                })
                .catch((error) => {
                  console.error("Error scaling image:", error);
                  reject(error);
                });
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      });

      try {
        await Promise.all(scaledImagesPromises);
        console.log("All images processed and scaled successfully");
      } catch (error) {
        console.error("Error processing images:", error);
      }
    }
  }

  function resizeDataUrl(
    dataUrl: string,
    maxSize: number,
    imageQuality: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", imageQuality));
        } else {
          reject(new Error("Failed to get 2D context"));
        }
      };
      img.onerror = (error) => reject(error);
      img.src = dataUrl; // Trigger onload event
    });
  }

  function handleFormChange(e: any) {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [name]: value }));
  }

  async function handleFormSubmit(e: any) {
    e.preventDefault();
    try {
      const result = await fetch(`${baseUrl}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData()),
      }).then((res) => res.json());
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getMessages() {
    props.setAccountPage("messages");
    const result = await fetch(`${baseUrl}/messages`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json());
    console.log(result);
  }

  async function logout() {
    const result = await fetch(`${baseUrl}/user/logout`, {
      method: "POST",
      credentials: "include",
    }).then((res) => res.json());
    if (result.status === 204) {
      props.setIsLoggedIn(false);
    }
    console.log("logout result: ", result);
  }

  createEffect(() => {
    if (props.accountPage() === "addImages") untrack(getCroppedDataUrl);
  });

  onCleanup(() => {
    if (cropperInstance()) {
      cropperInstance()?.destroy();
    }
  });

  return (
    <div class="account">
      <Suspense>
        <Show when={!props.isLoggedIn()}>
          <Login
            setIsLoggedIn={props.setIsLoggedIn}
            setUserId={props.setUserId}
          />
        </Show>
      </Suspense>
      <Suspense>
        <Show when={props.isLoggedIn() && props.accountPage() === "account"}>
          <h2>Account</h2>
          <div class="account-list">
            <div class="separation"></div>
            <button onMouseDown={getItems}>Items</button>
            <div class="separation"></div>
            <button onMouseDown={getMessages}>Messages</button>
            <div class="separation"></div>
            <button onMouseDown={logout}>Logout</button>
            <div class="separation"></div>
          </div>
        </Show>
        <Show when={props.accountPage() === "items"}>
          <h2>Your Items</h2>
          <div class="account-list">
            <div class="separation"></div>
            <div class="new-item-parent">
              <button onMouseDown={addItem}>+ New Item</button>
            </div>
            <div class="account-list item-page">
              <Show when={itemPageCount() > 0}>
                <div class="item-page-parent">
                  <Show when={itemPage() > 1}>
                    <div class="item-arrow backwards">
                      <button onMouseDown={() => clickItemArrow(-1)}>
                        <IconArrow />
                      </button>
                    </div>
                  </Show>
                  <div class="item-page-number">
                    {itemPage()}/{itemPageCount()}
                  </div>
                  <Show when={itemPage() < itemPageCount()}>
                    <div class="item-arrow">
                      <button onMouseDown={() => clickItemArrow(1)}>
                        <IconArrow />
                      </button>
                    </div>
                  </Show>
                </div>
              </Show>
              <For each={currentItems()}>
                {(item: any) => (
                  <div>
                    <div>
                      {JSON.stringify(item.city)}
                      {JSON.stringify(item.euro_price)}
                    </div>
                    <div class="separation"></div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
        <Show when={props.accountPage() === "addItem"}>
          <h2>Add New Item</h2>
          <div class="separation"></div>
          <div class="account-list">
            <div class="item-form">
              <Suspense>
                <Show when={openFormNumber() === 1}>
                  <SearchBar
                    isAll={true}
                    setOpenDropdownNumber={props.setOpenDropdownNumber}
                    setMoveMapCoordinates={props.setMoveMapCoordinates}
                    markers={props.markers}
                    setMarkers={props.setMarkers}
                    lowestPrice={props.lowestPrice}
                    setLowestPrice={props.setLowestPrice}
                    highestPrice={props.highestPrice}
                    setHighestPrice={props.setHighestPrice}
                    states={props.states}
                    setStates={props.setStates}
                    selectedState={props.selectedState}
                    setSelectedState={props.setSelectedState}
                    propertyItems={props.propertyItems}
                    setPropertyItems={props.setPropertyItems}
                    itemSort={props.itemSort}
                    countries={props.countries}
                    setCountries={props.setCountries}
                    selectedCountry={props.selectedCountry}
                    setSelectedCountry={props.setSelectedCountry}
                    selectedCity={props.selectedCity}
                    setSelectedCity={props.setSelectedCity}
                  />
                </Show>
                <Show when={openFormNumber() === 2}>
                  <FilterType
                    saleType={itemSaleType}
                    setSaleType={setItemSaleType}
                    itemType={itemItemType}
                    setItemType={setItemItemType}
                  />
                </Show>
                <Show when={openFormNumber() === 3}>
                  <button
                    id="add-images-button"
                    onMouseDown={() => props.setAccountPage("addImages")}
                  >
                    Add Images
                  </button>
                </Show>
                <Show when={openFormNumber() === 4}>
                  <label for="input-price" class="input-price">
                    <div>Price:</div>
                    <div class="form-all-currencies-parent">
                      <AllCurrencies currencyText={""} />
                      <div class="form-currency-code">
                        <div>
                          <div>{itemCurrentCurrency()?.code}</div>
                        </div>
                        <IconArrow />
                      </div>
                    </div>
                    <div class="form-currency">
                      <input
                        id="input-price"
                        class="number-input"
                        type="number"
                        value="0"
                        min="0"
                        max={
                          props.saleType() === "rent" ? "50000" : "1000000000"
                        }
                      />
                    </div>
                    <div class="form-error-message"></div>
                  </label>
                </Show>
                <Show when={openFormNumber() === 5}>
                  <label for="input-size">
                    <div>Living Area:</div>
                    <div class="form-currency">
                      <div class="form-currency-text">
                        <select
                          id="form-display-units"
                          class="button-style"
                          onChange={(e) =>
                            setItemDisplayUnits(e.currentTarget?.value)
                          }
                        >
                          <option value="m">m²</option>
                          <option value="ft">ft²</option>
                        </select>
                      </div>
                      <input
                        id="input-size"
                        class="number-input"
                        type="number"
                        value="0"
                        min="0"
                        max={
                          props.saleType() === "rent" ? "50000" : "1000000000"
                        }
                      />
                    </div>
                    <div class="form-error-message"></div>
                  </label>
                </Show>
                <Show when={openFormNumber() === 6}>
                  <label for="input-plot">
                    <div>Plot Size:</div>
                    <div class="form-currency">
                      <div class="form-currency-text">
                        <span>
                          {itemDisplayUnits()}
                          <sup>2</sup>
                        </span>
                      </div>
                      <input
                        id="input-plot"
                        class="number-input"
                        type="number"
                        value="0"
                        min="0"
                        max={
                          props.saleType() === "rent" ? "50000" : "1000000000"
                        }
                      />
                    </div>
                    <div class="form-error-message"></div>
                  </label>
                </Show>
                {/* <label for="input-">
                <input id="input-" type="number" value="0" min="0" max="" />
                </label>
                <div class="separation"></div> */}
              </Suspense>
              <Pagination
                totalNumber={totalNumber}
                currentNumber={openFormNumber}
                setCurrentNumber={setOpenFormNumber}
              />
            </div>
          </div>
        </Show>
        <Show when={props.accountPage() === "addImages"}>
          <h2>Upload Images</h2>
          <div class="upload-parent">
            <div class="uploaded-images-list">
              <For each={scaledImages()}>
                {(img: string | string[]) => {
                  const dataUrl = typeof img === "string" ? img : img[1];
                  return (
                    <div
                      class={`button-style ${
                        selectedImage() === dataUrl ? "highlighted" : ""
                      }`}
                      onMouseDown={() => initializeCroppr(dataUrl)}
                    >
                      <img src={dataUrl} />
                    </div>
                  );
                }}
              </For>
            </div>
            <div class="account-list crop-parent">
              <label class="button-style button-2x" for="image-upload">
                Upload
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageCropping}
              />
              <div class="crop-container">
                <img
                  class="crop-image"
                  ref={imageRef}
                  src={selectedImage() as string}
                  alt=""
                />
              </div>
              <Show when={cropper()}>
                <div class="crop-tools">
                  <button onMouseDown={rotateImage}>
                    <IconRotate />
                  </button>
                  <button class="wide-button" onMouseDown={undoCrop}>
                    Undo
                  </button>
                  <button onMouseDown={getCroppedDataUrl}>Ok</button>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </Suspense>
    </div>
  );
}
