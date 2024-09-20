export default function getTrunucatedString(string: string, max: number) {
  if (string.length > max) {
    return string.substring(0, max - 3) + "...";
  } else {
    return string;
  }
}
