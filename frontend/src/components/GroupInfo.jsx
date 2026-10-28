import { useEffect, useRef } from "react";
import { GROUP_MEMBERS } from "../config.js";
import { onFrame, prefersReducedMotion } from "../scroll.js";

// GROUP INFO: the section is tall; inside it a sticky stage slides the member cards sideways
// while you scroll down. Each card turns in 3D depending on how far it is from the centre.
export default function GroupInfo() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const barRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    return onFrame(() => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const box = section.getBoundingClientRect();
      const scrollable = box.height - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -box.top / scrollable));
      const viewport = window.innerWidth;
      const travel = Math.max(0, track.scrollWidth - viewport);

      track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      if (pathRef.current) pathRef.current.style.strokeDashoffset = String(1 - progress);

      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        // -1 (far left) .. 0 (centre) .. +1 (far right)
        const offset = Math.max(-1.2, Math.min(1.2, (rect.left + rect.width / 2 - viewport / 2) / (viewport / 2)));
        const flat = prefersReducedMotion ? 0 : 1;
        card.style.transform =
          `perspective(1400px) translateZ(${-Math.abs(offset) * 160 * flat}px) ` +
          `rotateY(${-offset * 38 * flat}deg) rotateX(${Math.abs(offset) * 6 * flat}deg) ` +
          `scale(${1 - Math.abs(offset) * 0.08 * flat})`;
        card.style.opacity = String(1 - Math.min(0.55, Math.abs(offset) * 0.45));
      });
    });
  }, []);

  return (
    <section id="group" className="group-section" ref={sectionRef}>
      <div className="group-sticky">
        <div className="group-head container">
          <p className="kicker">09 · The team</p>
          <h2 className="group-title">GROUP INFO</h2>
          <p className="section-lead">Programming for AI · Project VentureMap — keep scrolling to meet the group.</p>
        </div>

        <svg className="flow-line" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 70 C 150 10, 250 130, 400 70 S 650 10, 800 70 S 950 120, 1000 60"
                className="flow-base" />
          <path ref={pathRef} pathLength="1" strokeDasharray="1" strokeDashoffset="1"
                d="M0 70 C 150 10, 250 130, 400 70 S 650 10, 800 70 S 950 120, 1000 60"
                className="flow-live" />
        </svg>

        <div className="group-track" ref={trackRef}>
          <div className="group-intro">
            <span>Meet</span>
            <strong>the team</strong>
            <i aria-hidden="true">→</i>
          </div>

          {GROUP_MEMBERS.map((member, index) => (
            <article key={member.roll} className="member-card" ref={(el) => (cardRefs.current[index] = el)}>
              <div className="member-glow" aria-hidden="true" />
              <div className="cube-wrap" aria-hidden="true">
                <div className="cube" style={{ "--d": `${index * -3}s` }}>
                  <span className="face f1" /><span className="face f2" /><span className="face f3" />
                  <span className="face f4" /><span className="face f5" /><span className="face f6" />
                </div>
              </div>
              <div className="member-num">0{index + 1}</div>
              <div className="monogram" aria-hidden="true">
                {member.name.split(" ").filter((w) => /[A-Za-z]/.test(w[0])).slice(0, 2).map((w) => w[0]).join("")}
              </div>
              <h3>{member.name}</h3>
              <p className="member-roll">{member.roll}</p>
              <p className="member-tag">Group member</p>
            </article>
          ))}

          <div className="group-outro">
            <span>Thank you</span>
            <strong>VentureMap</strong>
          </div>
        </div>

        <div className="group-progress" aria-hidden="true"><div ref={barRef} /></div>
      </div>
    </section>
  );
}
