import { useState } from "react";
import DecryptText from "./DecryptText";

/** Futuristic AI boot sequence: pure black, name decrypts, tagline fades in. */
export default function Splash() {
  const [done, setDone] = useState(false);
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6">
      <DecryptText target="YOLO HOMES" className="text-3xl sm:text-4xl" onComplete={() => setDone(true)} />
      <div
        className={`mt-5 flex flex-col items-center transition-opacity duration-700 ${
          done ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <p className="mt-3 text-[11px] tracking-[0.3em] text-white/55">
          SMART APARTMENT MANAGEMENT
        </p>
      </div>
    </div>
  );
}
