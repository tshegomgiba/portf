import React, { useEffect, useState } from "react";
import { Repeat, Volume2, VolumeX } from "lucide-react";
import {
  isAtmosphereOn,
  toggleAtmosphere,
  watchAtmosphere,
} from "./atmosphere";
import { cutSpeech, isRepeatOn, toggleRepeat, watchRepeat } from "./voice";

const AtmosphereToggle = () => {
  const [sound, setSound] = useState(isAtmosphereOn);
  const [repeat, setRepeat] = useState(isRepeatOn);

  useEffect(() => watchAtmosphere(setSound), []);
  useEffect(() => watchRepeat(setRepeat), []);

  const muteAll = () => {
    const next = toggleAtmosphere();
    setSound(next);
    if (!next) cutSpeech();
  };

  return (
    <div
      className="fixed z-[65] flex items-center gap-2"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        onClick={() => setRepeat(toggleRepeat())}
        aria-label={repeat ? "Stop repeating Pixel" : "Repeat Pixel lines"}
        aria-pressed={repeat}
        className={`flex h-11 w-11 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/15 backdrop-blur-md transition-colors hover:bg-[#16232f] ${
          repeat ? "bg-[#2f7ea8] text-white" : "bg-[#16232f]/80 text-white/55"
        }`}
      >
        <Repeat size={15} />
      </button>
      <button
        type="button"
        onClick={muteAll}
        data-sound-toggle
        title={sound ? "Mute all sound" : "Unmute sound"}
        aria-label={sound ? "Mute all sound, including Pixel and Bit" : "Unmute sound"}
        aria-pressed={!sound}
        className="flex h-11 w-11 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/15 bg-[#16232f]/80 text-white backdrop-blur-md transition-colors hover:bg-[#16232f]"
      >
        {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
};

export default AtmosphereToggle;
