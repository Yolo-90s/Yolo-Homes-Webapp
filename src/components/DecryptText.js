import { useEffect, useRef, useState } from "react";

const SCRAMBLE = (
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$!?/<>*+=" +
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾊﾋﾌﾍﾎ"
).split("");

/** AI "decryption" effect: each glyph scrambles, then locks left-to-right into `target`. */
export default function DecryptText({ target, className = "", onComplete }) {
  const [display, setDisplay] = useState(" ".repeat(target.length));
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    const n = target.length;
    const framesPerChar = 4;
    const total = n * framesPerChar + 6;
    let frame = 0;
    const id = setInterval(() => {
      const locked = Math.floor(frame / framesPerChar);
      let out = "";
      for (let i = 0; i < n; i++) {
        const c = target[i];
        if (c === " ") out += " ";
        else if (i < locked) out += c;
        else out += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }
      setDisplay(out);
      frame++;
      if (frame > total) {
        clearInterval(id);
        setDisplay(target);
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete && onComplete();
        }
      }
    }, 45);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <div className={`font-mono font-bold tracking-[0.35em] text-white glow ${className}`}>
      {display}
    </div>
  );
}
