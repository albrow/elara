import { useContext } from "react";

import { SoundManagerContext } from "../contexts/sound_manager";

export const useSoundManager = () => useContext(SoundManagerContext);
