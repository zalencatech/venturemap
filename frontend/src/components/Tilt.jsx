import { useRef } from "react";

// A card that tilts towards the mouse (3D hover effect).
export default function Tilt({ children, className = "", max = 9 }) {
  const ref = useRef(null);

  function handleMove(event) {
    if (event.pointerType === "touch") return;
    const box = ref.current.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    ref.current.style.setProperty("--ry", `${px * max * 2}deg`);
    ref.current.style.setProperty("--rx", `${-py * max * 2}deg`);
    ref.current.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    ref.current.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  }

  function reset() {
    ref.current.style.setProperty("--ry", "0deg");
    ref.current.style.setProperty("--rx", "0deg");
  }

  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={handleMove} onPointerLeave={reset}>
      {children}
    </div>
  );
}
