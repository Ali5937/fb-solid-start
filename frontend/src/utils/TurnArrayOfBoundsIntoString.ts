export default function turnArrayOfBoundsIntoString(arr: number[][]) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += `${arr[i][0]}_${arr[i][1]}${i < arr.length - 1 ? "," : ""}`;
  }
  return str;
}
