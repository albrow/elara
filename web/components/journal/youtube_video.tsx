import { Box } from "@chakra-ui/react";

export interface YoutubeVideoProps {
  embedId: string;
}

export default function YoutubeVideo(props: YoutubeVideoProps) {
  return (
    <Box mt="30px" mb="40px">
      <iframe
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          borderColor: "gray",
          borderWidth: "1px",
        }}
        width="852"
        height="480"
        src={`https://www.youtube.com/embed/${props.embedId}?rel=0&modestbranding=1&origin=https://play.elaragame.com`}
        allowFullScreen
        title="YouTube video player"
      />
    </Box>
  );
}
