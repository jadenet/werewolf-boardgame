export default function createTimer(intervalFunc, afterFunc, defaultTime: number) {
  let countdown = defaultTime;

  let interval = setInterval(() => {
    intervalFunc(countdown)
    countdown -= 1;
  }, 1000);

  let timeout = setTimeout(() => {
    afterFunc(countdown)
    clearInterval(interval);
    clearTimeout(timeout);
  }, (defaultTime + 1) * 1000);
}
