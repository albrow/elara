export interface MiniSpriteProps {
  imgUrl: string;
}

export default function MiniSprite(props: MiniSpriteProps) {
  return (
    <img
      alt=""
      style={{
        display: "inline",
        width: "1.3rem",
        height: "1.3rem",
        verticalAlign: "middle",
        marginRight: "0.1rem",
        marginLeft: "0.1rem",
      }}
      src={props.imgUrl}
    />
  );
}
