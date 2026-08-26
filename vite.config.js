import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { bitVoicePlugin } from "./vite-plugin-bit-voice.js";

const WEB3FORMS_KEY = "619de087-0c8c-4cd2-b2f4-402f8d1c36f2";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const accessKey = (env.VITE_WEB3FORMS_KEY || WEB3FORMS_KEY).trim();

  return {
    plugins: [react(), bitVoicePlugin()],
    define: {
      "import.meta.env.VITE_WEB3FORMS_KEY": JSON.stringify(accessKey),
    },
  };
});
