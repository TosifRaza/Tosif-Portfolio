import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function MatrixRain({ onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops = [];
    let frame = 0;
    let lastFrame = 0;
    const fontSize = 16;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      columns = Math.ceil(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
      context.fillStyle = "#000";
      context.fillRect(0, 0, width, height);
    };

    const draw = (time) => {
      frame = window.requestAnimationFrame(draw);
      if (time - lastFrame < 42) return;
      lastFrame = time;

      context.fillStyle = "rgba(0, 0, 0, 0.09)";
      context.fillRect(0, 0, width, height);
      context.font = `${fontSize}px monospace`;
      drops.forEach((drop, column) => {
        context.fillStyle = Math.random() > 0.96 ? "#d7ffe7" : "#00e65c";
        context.fillText(Math.random() > 0.5 ? "1" : "0", column * fontSize, drop * fontSize);
        if (drop * fontSize > height && Math.random() > 0.975) drops[column] = 0;
        else drops[column] += 1;
      });
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    resize();
    frame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[10000] overflow-hidden bg-black" role="dialog" aria-modal="true" aria-label="Matrix rain">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 font-mono text-xs text-green-400">
        <span>MATRIX MODE // ESC TO EXIT</span>
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto rounded-md border border-green-500/40 bg-black/70 p-2 text-green-300 transition hover:bg-green-500/20 hover:text-white"
          aria-label="Exit Matrix mode"
          title="Exit Matrix mode"
        >
          <X size={18} />
        </button>
      </div>
    </div>,
    document.body
  );
}
