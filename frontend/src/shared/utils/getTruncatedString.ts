export default function getTruncatedString(string: string, max: number) {
  if (string.length > max) {
    return `${string.substring(0, max)}...`;
  }

  return string;
}