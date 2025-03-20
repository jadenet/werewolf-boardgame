import { useEffect, useRef } from "react";

export function Video({
  srcObject,
  ...props
}: {
  srcObject: MediaStream;
} & React.ComponentPropsWithoutRef<"video">) {
  const videoRef = useRef<HTMLVideoElement>();

  useEffect(() => {
    if (!videoRef.current || videoRef.current.srcObject === srcObject) {
      return;
    }

    videoRef.current.srcObject = srcObject;
  }, [srcObject]);

  return <video ref={videoRef} {...props} />;
}
