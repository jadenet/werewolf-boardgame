import { useEffect, useState } from "react";

export default function setTimer(default_time: number) {
    const [time, setTime] = useState(default_time);
    const [timerStopped, setTimerStopped] = useState(false);

    useEffect(() => {
      let timeout: any;
      if (time > 0) {
        timeout = setTimeout(() => {
          setTime(time - 1);
        }, 1000);
      } else {
        setTimerStopped(true);
      }

      return () => {
        clearTimeout(timeout);
      };
    }, [time]);

    return [time, timerStopped, setTimerStopped];
  }