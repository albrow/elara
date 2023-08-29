import { useContext } from "react";

import { JukeboxContext } from "../contexts/jukebox";

export const useJukebox = () => useContext(JukeboxContext);
