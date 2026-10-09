import { KANJI_D, LETTERS } from "@/components/brand/logo-paths";
import { KANJI_ID, letterId } from "@/components/brand/logo-meta";

/**
 * Sprite SVG do logo oficial — renderizado uma única vez no layout (Server Component).
 * Emblema e letras são reutilizados em todo o site via `<use href="#…">`.
 */
export function LogoSprite() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <path id={KANJI_ID} d={KANJI_D} fillRule="evenodd" />
        {LETTERS.map((l, i) => (
          <path key={i} id={letterId(i)} d={l.d} fillRule="evenodd" />
        ))}
      </defs>
    </svg>
  );
}
