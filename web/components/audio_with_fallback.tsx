import { forwardRef } from "react";

export interface AudioProps {
  oggSrc: string;
  mp3Src: string;
}

export const AudioWithFallback = forwardRef(
  (props: AudioProps, ref: React.ForwardedRef<HTMLAudioElement>) => (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio ref={ref} preload="auto" autoPlay={false}>
      <source src={props.oggSrc} type="audio/ogg" />
      <source src={props.mp3Src} type="audio/mpeg" />
    </audio>
  )
);
