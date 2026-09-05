Aimport { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
//  LOCAL SAVING
//  Persists progress to the browser's localStorage so it survives
//  refreshes and revisits. Wrapped in try/catch so it silently does
//  nothing where storage is blocked (e.g. sandboxed previews) instead
//  of crashing. Works on the real deployed site and local dev.
// ═══════════════════════════════════════════════════════════
const SAVE_KEY = "rollcard_save_v1";
function loadSave(){
  try{
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
function writeSave(data){
  try{
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }catch(e){ /* storage unavailable — ignore */ }
}
function clearSave(){
  try{ window.localStorage.removeItem(SAVE_KEY); }catch(e){}
}

// ═══════════════════════════════════════════════════════════
//  ⭐ DROP YOUR ART HERE ⭐
//  When you have your PNGs, paste their URLs into this object.
//  Structure matches the folder layout:
//    /assets/warriors/mongolian/tier1.png  →  ART.mongol[0]
//  Leave a slot as null (or "") and it falls back to the
//  built-in pixel sprite automatically. Nothing else changes.
// ═══════════════════════════════════════════════════════════
const ART = {
  mongol: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284931/mongolia_tier_1_normal-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284930/tier_2_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284930/tier_3_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284930/tier_4_mongolia-removebg-preview.png",
  ],
  knight: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285427/lvl_1_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285427/lvl_2_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285428/lvl_3_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285428/lvl_4_knight-removebg-preview.png",
  ],
  viking: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285429/lvl_1_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285429/lvl_2_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285430/lvl_3_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285431/lvl_4_viking-removebg-preview.png",
  ],
  samurai: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285434/lvl_1_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285434/lvl_2_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285435/lvl_3_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285435/lvl_4_samurai-removebg-preview.png",
  ],
  spartan: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285431/lvl_1_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285432/lvl_2_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285432/lvl_3_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788285433/lvl_4_spartan-removebg-preview.png",
  ],
  roman: (()=>{const u="https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495912/Normal_ROMAN.png";return [u,u,u,u];})(),
  khan: (()=>{const u="https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495912/normal_stand_Khan.png";return [u,u,u,u];})(),
};

// ═══════════════════════════════════════════════════════════
//  ⭐ DUEL BACKGROUNDS (home fields) ⭐
//  One scene per warrior line — shown behind the fighters in a duel.
//  In a duel, the background = the DEFENDER's home turf, and that
//  fighter gets a small "home-field" edge. Paste a wide/landscape
//  image URL for each. null = falls back to a themed color gradient.
//  Suggested prompts:
//   mongol : "wide Mongolian steppe, gers (yurts), grazing horses, distant hills, painterly game art, no characters"
//   knight : "castle courtyard with stone walls and banners, painterly game art, no characters"
//   viking : "rocky Nordic fjord with longships and grey sea, painterly game art, no characters"
//   samurai: "misty bamboo forest with a distant pagoda, painterly game art, no characters"
//   spartan: "rugged Greek mountain cliffs under bronze sky, painterly game art, no characters"
// ═══════════════════════════════════════════════════════════
const BACKGROUNDS = {
  mongol:  "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788233315/IMG_4774.jpg",
  knight:  "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788233315/IMG_4778.jpg",
  viking:  "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788233316/IMG_4777.jpg",
  samurai: "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788233315/IMG_4775.jpg",
  spartan: "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788233316/IMG_4776_1.jpg",
  roman:   "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495912/roman_background.jpg",
  khan:    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495912/khan_background.jpg",
};
// Fallback gradient per line (used when a background is null)
const BG_GRADIENT = {
  mongol:  "linear-gradient(180deg, #3a4a5c 0%, #6b6248 55%, #4a4230 100%)",
  knight:  "linear-gradient(180deg, #2f3a4a 0%, #45505e 60%, #2a3038 100%)",
  viking:  "linear-gradient(180deg, #2a3846 0%, #3c5060 55%, #24333e 100%)",
  samurai: "linear-gradient(180deg, #2a2230 0%, #3c3040 55%, #241c28 100%)",
  spartan: "linear-gradient(180deg, #4a3628 0%, #6b4a2e 55%, #3a2818 100%)",
  roman:   "linear-gradient(180deg, #4a2828 0%, #6b3a30 55%, #3a1c1c 100%)",
  khan:    "linear-gradient(180deg, #4a3e1c 0%, #6b5a2e 55%, #3a2e12 100%)",
};

// ═══════════════════════════════════════════════════════════
//  ⭐ SPECIAL TIER-4 ART (optional) ⭐
//  The final rank can have a more dramatic image than the normal
//  tier-4 (e.g. Mongolian on a HORSE, Viking on a longship).
//  When a URL is here, it REPLACES the tier-4 image everywhere.
//  Leave null to just use the normal tier-4 art above.
//  Suggested prompts:
//   mongol : "Mongolian khan mounted on an armored warhorse, sabre raised, transparent background, painterly game art"
//   knight : "royal knight in full plate on a barded warhorse with lance, transparent background, painterly game art"
//   viking : "viking jarl standing at the prow of a longship, axe raised, transparent background, painterly game art"
//   samurai: "daimyo in grand ceremonial o-yoroi armor with war banners, transparent background, painterly game art"
//   spartan: "spartan king in ornate bronze armor with crimson cape and hoplon, transparent background, painterly game art"
// ═══════════════════════════════════════════════════════════
const TIER4_SPECIAL = {
  mongol:  null,
  knight:  null,
  viking:  null,
  samurai: null,
  spartan: null,
};

// ═══════════════════════════════════════════════════════════
//  ⭐ VICTORY / DEFEAT POSE ART (optional) ⭐
//  ONE ARRAY OF 4 PER WARRIOR — one pose per tier, matching their
//  actual gear at that rank. This matters: a Tier 1 "Wandering Rider"
//  shouldn't suddenly flash full armor on a win screen — that breaks
//  the whole "gear reflects your real rank" idea the app is built on.
//
//  You do NOT need all 4 tiers at once. Fill in whichever tier slots
//  you have art for — any empty slot ([tier]=null) just falls back
//  to the normal portrait + CSS tilt until you add that tier's image.
//  Fill them in gradually, in any order.
//
//  Slot index = tier - 1, so index 3 is Tier 4 (the "final form").
//  See victory-defeat-prompts.md for generator prompts.
// ═══════════════════════════════════════════════════════════
const VICTORY_ART = {
  mongol:  [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788283884/victory_tier_1_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284344/victory_tier_2_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284342/victory_tier_3_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284342/victory_tier_4_mongolia-removebg-preview.png",
  ],
  knight:  [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293263/victory_pose_tier_1_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293262/victory_tier_2_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293262/victory_tier_3_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293262/victory_tier_4_knight-removebg-preview.png",
  ],
  viking:  [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293261/victory_tier_1_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293261/victory_tier_2_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293260/victory_tier_3_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293260/victory_tier_4_viking-removebg-preview.png",
  ],
  samurai: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293259/victory_tier_1_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293259/victory_tier_2_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293258/victory_tier_3_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/victory_tier_4_samurai-removebg-preview.png",
  ],
  spartan: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/victory_tier_1_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/victory_tier_2_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/victory_tier_3_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/victory_tier_4_spartan-removebg-preview.png",
  ],
  roman: (()=>{const u="https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495913/Victory_pose_roman.png";return [u,u,u,u];})(),
  khan: (()=>{const u="https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495912/Victory_pose_khan.png";return [u,u,u,u];})(),
};

const DEFEAT_ART = {
  mongol:  [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284344/defeat_tier_1_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284343/defeat_tier_2_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284342/defeat_tier_3_mongolia-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788284342/defeat_tier_4_mongolia-removebg-preview.png",
  ],
  knight:  [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293263/defeat_pose_tier_1_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293262/defeat_tier_2_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293262/defeat_tier_3_knight-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293261/defeat_tier_4_knight-removebg-preview.png",
  ],
  viking:  [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293261/defeat_tier_1_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293260/defeat_tier_2_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293260/lose_tier_3_viking-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293260/lose_tier_4_viking-removebg-preview.png",
  ],
  samurai: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293259/defeat_tier_1_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293259/defeat_tier_2_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293258/defeat_tier_3_samurai-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293258/defeat_tier_4_samurai-removebg-preview.png",
  ],
  spartan: [
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/defeat_tier_1_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/defeat_tier_2_spartan-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/defeat_tier_3_spartan__2_-removebg-preview.png",
    "https://res.cloudinary.com/qt4ptjgy/image/upload/v1788293257/defeat_tier_4_spartan-removebg-preview.png",
  ],
  roman: (()=>{const u="https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495912/defeat_pose_roman.png";return [u,u,u,u];})(),
  khan: (()=>{const u="https://res.cloudinary.com/qt4ptjgy/image/upload/v1788495912/defeat_pose_khan.png";return [u,u,u,u];})(),
};


// ═══════════════════════════════════════════════════════════
//  PIXEL FALLBACK ENGINE (used until real art is dropped in)
// ═══════════════════════════════════════════════════════════
const PX = 3;
function drawPixels(data, palette, flip, scale = 1) {
  const rows = data.trim().split("\n");
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const cells = [];
  rows.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === "." || !palette[ch]) return;
      cells.push(<rect key={`${r}-${c}`} x={c*PX} y={r*PX} width={PX} height={PX} fill={palette[ch]} />);
    });
  });
  return (
    <svg viewBox={`0 0 ${w*PX} ${h*PX}`} width={w*PX*scale} height={h*PX*scale}
      style={{ imageRendering:"pixelated", transform: flip?"scaleX(-1)":"none" }}>
      {cells}
    </svg>
  );
}

// Turn a plain Cloudinary URL into an optimized delivery URL.
// Inserts f_auto,q_auto (format+quality auto) which also helps with embedding.
function optimize(url) {
  if (typeof url === "string" && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }
  return url;
}

// Unified warrior renderer: uses image if present & loads, else pixel sprite
// Per-warrior render scale to compensate for inconsistent framing in the source art
// (some generated images have the character smaller within the frame than others).
// 1 = no change. Tune these by eye until all warriors look roughly the same on-screen size.
const ART_SCALE = {
  mongol: 1, knight: 1, viking: 1, samurai: 1, spartan: 1,
  roman: 1.35, khan: 1.35, // premium warriors render bigger
};

function WarriorArt({ warriorKey, tier, flip, scale = 1, size = 150 }) {
  // Tier-4 special art overrides the normal tier-4 image when provided
  let url = ART[warriorKey] && ART[warriorKey][tier];
  if (tier === 3 && TIER4_SPECIAL[warriorKey]) url = TIER4_SPECIAL[warriorKey];
  const w = WARRIORS[warriorKey];
  const [failed, setFailed] = useState(false);

  if (url && !failed) {
    const dim = size * scale * (ART_SCALE[warriorKey] || 1);
    return (
      <img src={optimize(url)} alt={w.titles[tier]}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{
          width: dim, height: dim, objectFit: "contain",
          transform: flip ? "scaleX(-1)" : "none",
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55))",
          display: "block",
        }} />
    );
  }
  return drawPixels(SP[warriorKey][tier], w.pal, flip, scale);
}

// Renders the end-of-duel pose: real victory/defeat art if provided,
// otherwise falls back to the normal portrait + CSS tilt animation.
// The "flip" (facing direction) is handled on an outer, non-animated
// wrapper so it never fights with the pose animation.
function PoseArt({ warriorKey, won, tier, flip, size = 104 }) {
  const table = won ? VICTORY_ART : DEFEAT_ART;
  const url = table[warriorKey] && table[warriorKey][tier];
  const [failed, setFailed] = useState(false);

  if (url && !failed) {
    return (
      <div style={{ transform: flip ? "scaleX(-1)" : "none" }}>
        <div style={{ animation: "poseEnter 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
          <img src={optimize(url)} alt={won ? "Victory" : "Defeat"}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            style={{
              width: size, height: size, objectFit: "contain",
              filter: won
                ? "drop-shadow(0 8px 18px rgba(0,0,0,0.5))"
                : "drop-shadow(0 6px 14px rgba(0,0,0,0.5)) saturate(0.75) brightness(0.9)",
              display: "block",
            }} />
        </div>
      </div>
    );
  }
  // No pose art for THIS tier yet — fall back to the normal portrait (correct gear for this rank) with a CSS tilt
  return (
    <div style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <div style={{ animation: won ? "victoryPose 0.6s ease-out forwards" : "defeatKneel 0.5s ease-out forwards" }}>
        <WarriorArt warriorKey={warriorKey} tier={tier} size={size} />
      </div>
    </div>
  );
}

// ─── Palettes ───
const MONGOL_PAL={A:"#DFBC8E",S:"#C9986E",s:"#B5845C",a:"#9A6E48",H:"#2B211C",h:"#3D2F24",i:"#1A1410",T:"#7A3B2E",t:"#5E2D22",U:"#923F30",L:"#6E5340",l:"#5A4230",J:"#483520",W:"#BCC6D0",M:"#8B96A3",m:"#6B7580",w:"#525C66",G:"#E8C95E",g:"#C9A43E",Y:"#B89030",F:"#F0EBE0",f:"#D6CFBF",E:"#BDB5A4",K:"#5A3830",k:"#3F261E",R:"#A63636",r:"#CC4444",B:"#2A1F18",b:"#3D2E22",n:"#A87E5A"};
const KNIGHT_PAL={A:"#DFBC8E",S:"#C9986E",s:"#B5845C",a:"#9A6E48",H:"#4A3E34",h:"#5C5040",i:"#3A3028",T:"#5A6B48",t:"#4A5A3A",U:"#6E7E58",L:"#6E5340",l:"#5A4230",J:"#483520",W:"#BCC6D0",M:"#8B96A3",m:"#6B7580",w:"#525C66",G:"#E8C95E",g:"#C9A43E",Y:"#B89030",F:"#BCC6D0",f:"#8B96A3",E:"#6B7580",K:"#2A4899",k:"#1C3377",R:"#CC3333",r:"#EE4444",B:"#2A1F18",b:"#3D2E22",n:"#A87E5A",P:"#2A4899",p:"#1C3377"};
const VIKING_PAL={A:"#DFBC8E",S:"#C9986E",s:"#B5845C",a:"#9A6E48",H:"#9E7E52",h:"#B89060",i:"#806640",T:"#7A7568",t:"#636058",U:"#8C8878",L:"#6E5340",l:"#5A4230",J:"#483520",W:"#A8B4C0",M:"#7A8690",m:"#606A74",w:"#4A545E",G:"#E8C95E",g:"#C9A43E",Y:"#B89030",F:"#B09070",f:"#967858",E:"#7E6448",K:"#5A90B0",k:"#408098",R:"#5A90B0",r:"#70A8C8",B:"#2A1F18",b:"#3D2E22",n:"#A87E5A"};
const SAMURAI_PAL={A:"#DFBC8E",S:"#C9986E",s:"#B5845C",a:"#9A6E48",H:"#1A1518",h:"#2E2228",i:"#0E0A0C",T:"#443850",t:"#342840",U:"#584A62",L:"#443850",l:"#342840",J:"#2A2034",W:"#8B3030",M:"#6B2020",m:"#4E1616",w:"#3A0E0E",G:"#E8C95E",g:"#C9A43E",Y:"#B89030",F:"#CC4040",f:"#AA3030",E:"#882222",K:"#CC4040",k:"#AA3030",R:"#E8C95E",r:"#F0DA78",B:"#1A1518",b:"#2E2228",n:"#A87E5A"};
const SPARTAN_PAL={A:"#DFBC8E",S:"#C9986E",s:"#B5845C",a:"#9A6E48",H:"#2B211C",h:"#3D2F24",i:"#1A1410",T:"#8A3535",t:"#6E2828",U:"#A24040",L:"#6E5340",l:"#5A4230",J:"#483520",W:"#D4A23A",M:"#B8862E",m:"#8A6420",w:"#6B4E18",G:"#E8C95E",g:"#C9A43E",Y:"#B89030",F:"#CC3333",f:"#AA2222",E:"#882222",K:"#8A3535",k:"#6E2828",R:"#CC3333",r:"#EE4444",B:"#2A1F18",b:"#3D2E22",n:"#A87E5A"};

// ─── Sprites (fallback art) ───
const SP={
mongol:[`
..............iHHHi.............
.............iHHHHHi............
............iHHHhHHHi...........
............HHHhhhHHH...........
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsHsHss............
.............aSSSSa.............
..............sSs...............
............UTTTTU..............
...........UTTTTTTU.............
..........TTTTTTTTTt............
.........UTTTTTTTTTt............
.........tTTTTTTTTtt............
..........TgGGGGgT..............
..........lLLLLLLl..............
...........LLLLLL...............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
.............llLll..............
............llLLLll.............
...........llLLLLLll............
...........lLLlLlLLl............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsHsHss............
.............aSSSSa.............
..............sSs...............
...........JlLTTTTU.............
..........JlLTTTTTTU............
.........lLTTTTTTTTTt...........
.........LLTTTTTTTTT............
.........tTTTTTTTTtt............
..........TgGGGGgT..............
..........lLLLLLLl..............
...........LLLLLL...............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
.............wMMMw..............
............wMWWWMw.............
...........wMWMWMWMw............
...........mMMWGWMMm............
...........MMMMGMMMM............
...........MmASSSSAmM...........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsHsHss............
.............aSSSSa.............
..............sSs...............
............wMWWMw..............
.........MmMmWMMWmMmM...........
.........MMmMMMMMMmMM...........
.........mMMMMMMMMMm............
.........tTMMMMMMTTt............
..........TgGGGGgT..............
..........lLLLLLLl..............
..........mLLLLLLm..............
...........LLl.lLL..............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`,`
..............rRr...............
.............wMMMw..............
............wMWWWMw.............
...........wMWMGMWMw............
...........MMMMGMMMM............
..........FMmASSSSAmMF..........
..........EASSSSSSSSaE..........
............sSSSSSSs............
............sSsHsHss............
.............aSSSSa.............
...K..........sSs.........K.....
...K.........wMWWMw.......K.....
...KK....MmMmWMMWmMmM...KK.....
...KK....MMmMMMMMMmMM...KK.....
...kK....mMMMMMMMMMm....Kk.....
...kK....tTMMMMMMTTt....Kk.....
...kk.....TgGGGGgT.....kk.....
...kk.....lLLLLLLl.....kk......
...kk.....mLLLLLLm.....kk......
...k.......LLl.lLL......k......
............mLl.lLm.............
............bBl.lBb.............
............BB...BB.............`],
knight:[`
..............HHhH..............
.............HHHHHH.............
............HHhHhHHH............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
..............sSs...............
............UTTTTU..............
...........UTTTTTTU.............
..........TTTTTTTTTt............
.........UTTTTTTTTTt............
.........tTTTTTTTTtt............
..........lLLLLLLl..............
...........LLLLLL...............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
..............HHhH..............
.............HHHHHH.............
............HHhHhHHH............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
..............sSs...............
............wMMMWw..............
...........mMMMMMMm.............
..........MMMMMMMMMMm...........
.........MMMMTTTTMMMMm..........
.........tTTTTTTTTTTt...........
..........lLLLLLLl..............
...........LLLLLL...............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
............wMMMMMw.............
...........mMWWWWWMm............
...........MMmMMMmMM............
...........MwASSSSAwM...........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
..............sSs...............
.........WMmwMMMMwmMW...........
.........WMMWMWMWMMmW...........
.........WMMmMmMmMMmW...........
.........MMMMMMMMMMMm...........
.........MMTTTTTTTMM............
..........lLLLLLLl..............
..........mLLLLLLm..............
...........mLl.lLm..............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`,`
............wMMMMMw.............
...........mMWWWWWMm............
...........MMmMGMmMM............
...........MwASSSSAwM...........
..........FASSSSSSSSaF..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
...K..........sSs.........K.....
...KK..WMmwMMMMwmMW.....KK.....
...KK..WMMMGMMMMMW......KK.....
...kK..WMMmMmMmMMmW....Kk.....
...kK..MMMMMMMMMMMm....Kk......
...kk..MMTTTTTTTMM.....kk......
...kk...lLLLLLLl.......kk......
...k....mLLLLLLm......k........
..........mLl.lLm..............
..........mLl.lLm..............
..........bBl.lBb...............
..........BB...BB...............`],
viking:[`
............HHhHHHH.............
...........HHhHhHHHH............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
..............sSs...............
...SS........UTTTTU.......SS....
...sa.......UTTTTTTU......as....
...ss......TTTTTTTTTTt....ss....
...ss......tTTTTTTTTtt....ss....
............TTTTTTTT............
..........lLLLLLLLl.............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
............HHhHHHH.............
...........HHhHhHHHH............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
..............sSs...............
...SS.......JlLLLLl.......SS....
...sa......LLTTTTTTLL.....as....
...ss......lLTTTTTTLl.....ss....
............TTTTTTTT............
..........lLLLLLLLl.............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
............wMMMMMw.............
...........mMMWWMMm.............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
..............sSs...............
...SS....FfwMMMMMwfF......SS....
...sa....mMMMMMMMmmM......as....
...ss....mMTTTTTTMm.......ss....
............TTTTTTTT............
..........lLLLLLLLl.............
..........mLLLLLLLm.............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`,`
...........wMMrRMMw.............
...........mMMWWMMm.............
...........MMMGMMMM.............
...........MmASSSSAmM...........
.........FEsSSnSSnSSsEF.........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
..............sSs...............
...SS....FfwMMMMMwfF......SS....
...sa....mMMMWMWMmmM......as....
...ss....mMMMMMMMMm.......ss....
..........wMTTTTMw..............
..........lLLLLLLLl.............
..........mLLLLLLLm.............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`],
samurai:[`
.............iHHi...............
............iHHHHi..............
..........HHHHHHHHHh............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
..............sSs...............
............UTTTTU..............
..........uTTTTTTTTu............
..........TTTTTTTTTTt...........
.........tTTTTTTTTTtt...........
..........lLLLLLLl..............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
..........iHHHHHHHHi............
.........iHHHHHHHHHHi..........
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
..............sSs...............
............UTTTTU..............
..........uTTTTTTTTu............
..........TTTTTTTTTTt...........
.........tTTTTTTTTTtt...........
..........lLLLLLLl..............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
.............wMMMw..............
...........mMMMGMMMm............
...........MMMMMMMMM............
...........MmASSSSAmM...........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
..............sSs...............
.........WMmwMMMMwmMW...........
.........WMMMGMMMMW.............
.........WMMmMmMmmW.............
.........mMMMMMMMMm.............
.........tTTTTTTTTt.............
..........lLLLLLLl..............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`,`
..............rGr...............
............wMRGRMw.............
...........MMMMGMMMM............
...........MmASSSSAmM...........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sSsSsSss............
.............aSSSSa.............
..............sSs...............
.........WMmwMMMMwmMW...........
.........WMMWGWMMMMW............
.........WMMmMmMmmW.............
.........mMMMGMMMMm.............
.........tTTTGTTTTt.............
..........lLLLLLLl..............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`],
spartan:[`
..............HHhH..............
.............HHHHHH.............
............HHhHhHHH............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
..............sSs...............
...SS........UTTTTU.......SS....
...aS......UTTTTTTU.......Sa....
...as.....TTTTTTTTTTt.....sa....
...ss.....tTTTTTTTTtt.....ss....
............TTTTTTTT............
..........lLLLLLLLl.............
...........LLl.lLL..............
...........LLl.lLL..............
...........bBl.lBb..............
...........BB...BB..............`,`
..............HHhH..............
.............HHHHHH.............
............HHhHhHHH............
...........AASSSSSSSAa..........
...........ASSSSSSSSsa..........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
..............sSs...............
...SS.......wMMMWw........SS....
...aS......mMMMMMmM.......Sa....
...as.....MMTTTTTTMM......sa....
...ss.....tTTTTTTTTtt.....ss....
............TTTTTTTT............
..........lLLLLLLLl.............
..........mLLLLLLLm.............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`,`
............rRRRRRr.............
...........wMMMMMMMw............
...........MMWWWWWMM............
...........MmASSSSAmM...........
...........sSSnSSnSSsa..........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
..............sSs...............
...SS....WmwMMMMwmW.......SS....
...aS....MMMWMWMMM........Sa....
...as...MMTTTTTTTMMM......sa....
...ss.....TTTTTTTT........ss....
..........lLLLLLLLl.............
..........mLLLLLLLm.............
...........mLl.lLm..............
...........bBl.lBb..............
...........BB...BB..............`,`
............rRRRRRr.............
...........wMMMMMMMw............
...........MMmMGMmMM............
...........MmASSSSAmM...........
.........FEASSSSSSSSaEF.........
............sSSSSSSs............
............sHsSsSHs............
.............aSSSSa.............
...K..........sSs.........K.....
...KK..WmMmwMMMMwmMmW...KK.....
...KK..MMMWGWMMMMMM.....KK.....
...kK..MMTTTTTTTMM......Kk.....
...kk....TTTTTTTT.......kk......
...kk...lLLLLLLLl......kk.......
...k....mLLLLLLLm......k.......
..........mLl.lLm..............
..........bBl.lBb...............
..........BB...BB...............`],
};

const WARRIORS={
  mongol:{key:"mongol",name:"Mongolian Warrior",archetype:"Guard Wizard",tagline:"Patient, unconventional, dangerous from your back",accent:"#C98A3E",pal:MONGOL_PAL,titles:["Wandering Rider","Horse Archer","Steppe Raider","Khan's Vanguard"],desc:"You're never in trouble on the bottom — you're setting a trap.",winLine:(o)=>`You sweep clean, leaving ${o} scrambling.`,loseLine:(o)=>`${o} flattens your guard before the sweep comes.`},
  knight:{key:"knight",name:"Knight",archetype:"Pressure Passer",tagline:"Heavy hands, heavier hips",accent:"#7C8A9B",pal:KNIGHT_PAL,titles:["Squire","Man-at-Arms","Knight Errant","Round Table Knight"],desc:"You grind people down rather than rush a finish.",winLine:(o)=>`You bury ${o} under relentless pressure.`,loseLine:(o)=>`${o} breaks through and turns the tables.`},
  viking:{key:"viking",name:"Viking Berserker",archetype:"Scrambler",tagline:"Never where you left them",accent:"#4A8FB0",pal:VIKING_PAL,titles:["Raider","Shield-Bearer","Berserker","Jarl's Chosen"],desc:"You chain transitions before anyone can settle.",winLine:(o)=>`You scramble through chaos and take ${o}'s back.`,loseLine:(o)=>`${o} catches you mid-scramble.`},
  samurai:{key:"samurai",name:"Samurai",archetype:"Submission Hunter",tagline:"Always three moves ahead",accent:"#B33A3A",pal:SAMURAI_PAL,titles:["Ashigaru","Ronin","Samurai","Daimyo's Blade"],desc:"The tap is the whole point. You hunt from everywhere.",winLine:(o)=>`You finish clean before ${o} sees it.`,loseLine:(o)=>`You overcommit and ${o} reverses you.`},
  spartan:{key:"spartan",name:"Spartan",archetype:"The Anchor",tagline:"Control the hips, control the round",accent:"#B8862E",pal:SPARTAN_PAL,titles:["Agoge Recruit","Hoplite","Phalanx Captain","Spartan Elite"],desc:"Once on top, you're not in a hurry to leave.",winLine:(o)=>`You take ${o} down and ride full control.`,loseLine:(o)=>`${o} sweeps you before the takedown lands.`},
  roman:{key:"roman",name:"Roman Legatus",archetype:"The Legion",tagline:"Discipline is a weapon",accent:"#B0302E",pal:SPARTAN_PAL,premium:true,price:"$2.99",titles:["Legatus","Legatus","Legatus","Legatus"],desc:"Relentless, disciplined pressure — you advance in formation and never break.",winLine:(o)=>`You advance in perfect formation and overwhelm ${o}.`,loseLine:(o)=>`${o} finds the gap in your line.`},
  khan:{key:"khan",name:"The Great Khan",archetype:"The Conqueror",tagline:"All under heaven",accent:"#D9A93E",pal:MONGOL_PAL,premium:true,price:"$2.99",titles:["Great Khan","Great Khan","Great Khan","Great Khan"],desc:"An emperor's game — overwhelming, inevitable, and impossible to escape.",winLine:(o)=>`You conquer ${o} without mercy.`,loseLine:(o)=>`${o} weathers your storm and turns it back.`},
};

const ARCH_MAP={GW:"mongol",PP:"knight",SC:"viking",SH:"samurai",AN:"spartan"};
// Base (non-premium) warrior keys — used for default duel opponents so you never
// randomly face a premium warrior. Premium warriors are player-only.
const BASE_KEYS=["mongol","knight","viking","samurai","spartan"];

// Unlock milestones are POSITION-based, not tied to specific warriors — so every player
// has the same unlock journey no matter which warrior the quiz gave them. The warriors you
// didn't start with unlock one at a time (in a fixed order) as you hit these milestones.
// Mixing points and a competition requirement means everyone experiences both.
const UNLOCK_MILESTONES = [
  { type:"lifetime",    value:20,  label:"Earn 20 lifetime points" },
  { type:"lifetime",    value:45,  label:"Earn 45 lifetime points" },
  { type:"competition", value:2,   label:"Log 2 competitions" },
  { type:"lifetime",    value:90,  label:"Earn 90 lifetime points" },
];
// Fixed display order for the base warriors (your quiz warrior is pulled out; the rest
// fill the milestone slots above in this order).
const BASE_ORDER = ["mongol","knight","viking","samurai","spartan"];

// Given the player's starting (quiz) warrior, returns the ordered list of the OTHER
// four base warriors, each paired with the milestone that unlocks it. This makes the
// unlock path identical for everyone regardless of which warrior they started with.
function unlockPlan(startKey){
  const others = BASE_ORDER.filter((k)=>k!==startKey);
  return others.map((key,i)=>({ key, req: UNLOCK_MILESTONES[i] }));
}
// The requirement label to show for a given warrior in the roster (or null if not applicable).
function reqLabelFor(key, startKey){
  const plan = unlockPlan(startKey);
  const found = plan.find((p)=>p.key===key);
  return found ? found.req.label : null;
}

// Lightweight duel balance per archetype — small, flavor-driven edges, not stat gaps big
// enough to make any line unfair. Rank + timing still matter far more than this does.
//   attackZoneMod / defendZoneMod: added to the tap zone half-widths (bigger = more forgiving)
//   dmgMod: flat bonus added to base damage
//   dmgPctBonus: percentage damage bonus applied on top of a landed hit
//   speedMod: added to marker sweep speed when this warrior is the one attacking (higher = harder to time)
//   critMult: damage multiplier on a perfect ("critical") hit, default 1.8
const WARRIOR_BALANCE = {
  mongol:  { attackZoneMod:-2, defendZoneMod:+3, dmgMod:0,  dmgPctBonus:0,    speedMod:0,    critMult:1.8 }, // patient guard: hard to finish, hard to finish off
  knight:  { attackZoneMod:0,  defendZoneMod:0,  dmgMod:0,  dmgPctBonus:0,    speedMod:0,    critMult:1.8 }, // steady, no gimmicks
  viking:  { attackZoneMod:0,  defendZoneMod:0,  dmgMod:0,  dmgPctBonus:0.25, speedMod:0.4,  critMult:1.8 }, // fast and chaotic: harder to time, hits harder when it lands
  samurai: { attackZoneMod:-1, defendZoneMod:-1, dmgMod:0,  dmgPctBonus:0,    speedMod:0,    critMult:2.2 }, // precise finisher: tight windows, huge payoff on a crit
  spartan: { attackZoneMod:0,  defendZoneMod:+2, dmgMod:3,  dmgPctBonus:0,    speedMod:0,    critMult:1.8 }, // anchor: hits a little harder, blocks a little easier
  // Premium warriors — DISTINCT playstyles, balanced to be fair (net power ≈ same as base line). Not stronger, just different to play.
  roman:   { attackZoneMod:+2, defendZoneMod:+2, dmgMod:0,  dmgPctBonus:0,    speedMod:0.5,  critMult:1.5 }, // disciplined: forgiving timing both ways, but faster bar & smaller crits — steady, no big swings
  khan:    { attackZoneMod:-2, defendZoneMod:-2, dmgMod:0,  dmgPctBonus:0.15, speedMod:0,    critMult:2.4 }, // conqueror: tight windows & risky, but massive crits and bonus damage — high skill, high reward
};
const QUESTIONS=[
  {q:"First minute. What's in your head?",options:[{t:"Get a grip.",a:"AN"},{t:"Where's the choke.",a:"SH"},{t:"Let's see what happens.",a:"SC"},{t:"Get on top.",a:"PP"},{t:"Comfortable down here.",a:"GW"}]},
  {q:"Favorite part of class?",options:[{t:"Live rolling.",a:"SC"},{t:"Drilling sweeps.",a:"GW"},{t:"Positional sparring.",a:"AN"},{t:"Everyone's gassed.",a:"SH"},{t:"Passing guard.",a:"PP"}]},
  {q:"Advice for a white belt:",options:[{t:"Control the hips.",a:"AN"},{t:"Never stop moving.",a:"SC"},{t:"Get comfortable underneath.",a:"GW"},{t:"Heavy beats fast.",a:"PP"},{t:"Hunt the finish.",a:"SH"}]},
  {q:"Pick a warm-up:",options:[{t:"Hip escapes.",a:"GW"},{t:"Sprawls and takedowns.",a:"AN"},{t:"Nonstop scrambles.",a:"SC"},{t:"Grip fighting.",a:"PP"},{t:"Flow rolling, hunting subs.",a:"SH"}]},
  {q:"Against someone bigger:",options:[{t:"Pull guard.",a:"GW"},{t:"Angles and scrambles.",a:"SC"},{t:"Takedowns, grind top.",a:"AN"},{t:"Get heavy on them.",a:"PP"},{t:"Go for the finish.",a:"SH"}]},
  {q:"Happiest move:",options:[{t:"Clean sweep from guard.",a:"GW"},{t:"Pass into mount.",a:"PP"},{t:"Scramble to the back.",a:"SC"},{t:"Any tap.",a:"SH"},{t:"Takedown to side control.",a:"AN"}]},
];
const THRESHOLDS=[0,10,25,50];

// Standard adult BJJ belts. Rank is set by the user (promotions are the coach's real-world call).
const BELTS = [
  { key:"white",  name:"White",  color:"#E8E8E8", text:"#14181F" },
  { key:"blue",   name:"Blue",   color:"#2E6FC9", text:"#FFFFFF" },
  { key:"purple", name:"Purple", color:"#7B4Fc9", text:"#FFFFFF" },
  { key:"brown",  name:"Brown",  color:"#6B4423", text:"#FFFFFF" },
  { key:"black",  name:"Black",  color:"#1A1A1A", text:"#FFFFFF" },
];
function beltOf(key){ return BELTS.find((b)=>b.key===key) || BELTS[0]; }

const SHOP_ITEMS=[
  {id:"aura_gold",name:"Golden Aura",price:"Free",desc:"A warm glow behind your warrior",color:"#C9A15A",owned:true},
  {id:"aura_ice",name:"Ice Aura",price:"$0.99",desc:"Frozen mist surrounds your fighter",color:"#6AC5E8",owned:false},
  {id:"aura_fire",name:"Fire Aura",price:"$0.99",desc:"Flames rise behind your warrior",color:"#E85A3A",owned:false},
  {id:"title_og",name:"\"OG\" Title",price:"$2.99",desc:"Show everyone you were here first",color:"#C9A15A",owned:false},
  {id:"line_aztec",name:"Aztec Eagle Warrior",price:"$4.99",desc:"Unlock a new warrior line",color:"#2EA87A",owned:false},
];

// Quick-tap technique tags for logging what happened in a session.
// Tapping is fast (no typing); an optional note box exists for anyone who wants to type more.
const TAG_OPTIONS = ["Triangle","Armbar","Kimura","Guillotine","RNC","Ankle Lock","Americana","Sweep","Takedown","Guard Pass","Escape","Back Take"];
// Strength/conditioning session types (tracked separately — never award warrior points).
const STRENGTH_TYPES = ["Lifting","Conditioning","Mobility","Cardio"];
// Default minutes for a BJJ class breakdown. Pre-filled so logging stays one-tap;
// users can adjust per-session but never have to. (Mirrors IU BJJ's typical class.)
const DEFAULT_BREAKDOWN = { warmup:30, drilling:60, rolling:60 };

function formatDate(d){
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── Class schedule ───
// Default set to IU BJJ's times; fully editable in-app so it fits any gym.
// day: 0=Sun … 6=Sat. Times are "HH:MM" 24h. Editable via the Schedule screen.
const DEFAULT_SCHEDULE = [
  { day: 2, start: "19:30", end: "22:00" }, // Tuesday
  { day: 4, start: "19:30", end: "22:00" }, // Thursday
  { day: 6, start: "10:00", end: "12:00" }, // Saturday
];
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_ABBR  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function to12h(hhmm){
  const [h,m]=hhmm.split(":").map(Number);
  const ap=h>=12?"PM":"AM";
  const h12=h%12===0?12:h%12;
  return `${h12}:${String(m).padStart(2,"0")} ${ap}`;
}
// Given the schedule and "now", figure out today's class status and the next upcoming class.
function scheduleStatus(schedule, now){
  const dow=now.getDay();
  const nowMin=now.getHours()*60+now.getMinutes();
  const parse=(t)=>{const [h,m]=t.split(":").map(Number);return h*60+m;};
  // Is there a class today, and where are we relative to it?
  const today=schedule.find((s)=>s.day===dow);
  let todayState=null; // "upcoming" | "ongoing" | "done" | null
  if(today){
    const st=parse(today.start), en=parse(today.end);
    if(nowMin<st) todayState="upcoming";
    else if(nowMin<=en) todayState="ongoing";
    else todayState="done";
  }
  // Find the next class strictly in the future (skips today's if already ended)
  let next=null;
  for(let ahead=0; ahead<=7 && !next; ahead++){
    const d=(dow+ahead)%7;
    const classes=schedule.filter((s)=>s.day===d).sort((a,b)=>parse(a.start)-parse(b.start));
    for(const c of classes){
      if(ahead===0 && parse(c.start)<=nowMin) continue; // today but already started/passed
      next={...c, ahead};
      break;
    }
  }
  return { today, todayState, next };
}

// Gym leaderboard — other members at your academy.
// "verified" = attendance confirmed by the gym's check-in (vs self-reported).
const GYM_NAME = "Ronin BJJ Academy";
const GYM_MEMBERS = [
  {name:"Marcus T.",  line:"spartan", points:64, streak:9, verified:true},
  {name:"Priya K.",   line:"viking",  points:52, streak:6, verified:true},
  {name:"Diego R.",   line:"samurai", points:47, streak:4, verified:false},
  {name:"Sam O.",     line:"knight",  points:33, streak:5, verified:true},
  {name:"Jordan L.",  line:"mongol",  points:21, streak:2, verified:false},
  {name:"Alex W.",    line:"knight",  points:14, streak:1, verified:true},
];

export default function App(){
  // Load any saved progress once, synchronously, before first render.
  const saved = loadSave();
  const [screen,setScreen]=useState(saved?.warriorKey ? "home" : "intro");
  const [qIndex,setQIndex]=useState(0);
  const [tally,setTally]=useState({GW:0,PP:0,SC:0,SH:0,AN:0});
  const [warriorKey,setWarriorKey]=useState(saved?.warriorKey ?? null); // the ACTIVE warrior — receives new points
  // Every warrior line keeps its own saved progress, even ones you're not using right now.
  const [warriorProgress,setWarriorProgress]=useState(saved?.warriorProgress ?? {mongol:0,knight:0,viking:0,samurai:0,spartan:0});
  const [unlockedWarriors,setUnlockedWarriors]=useState(saved?.unlockedWarriors ?? []); // keys unlocked so far (quiz pick + milestones)
  const [newlyUnlocked,setNewlyUnlocked]=useState(null);     // warrior key just unlocked, for the celebration overlay
  const points=warriorProgress[warriorKey]??0; // derived: active warrior's own progress
  const [streak,setStreak]=useState(saved?.streak ?? 0);
  const [revealed,setRevealed]=useState(false);
  const [oppKey,setOppKey]=useState(saved?.warriorKey ? BASE_KEYS.find((k)=>k!==saved.warriorKey)||"knight" : null);
  const [oppTier,setOppTier]=useState(1);
  const [duelPhase,setDuelPhase]=useState("idle"); // idle | attack | defend | resolve | result
  const [duelResult,setDuelResult]=useState(null);
  const [record,setRecord]=useState(saved?.record ?? {w:0,l:0});
  const [hpYou,setHpYou]=useState(100);
  const [hpOpp,setHpOpp]=useState(100);
  const [markerPos,setMarkerPos]=useState(0);   // 0..100 position of sweeping marker
  const [duelLog,setDuelLog]=useState("");        // last-action narration line
  const [hitFlash,setHitFlash]=useState(null);    // "you" | "opp" | null — who just got hit
  const [lockedZone,setLockedZone]=useState(null);// {result, at} freeze marker on tap
  const [homeField,setHomeField]=useState(null);  // "you" | "opp" — whose home turf this duel is on
  const [slash,setSlash]=useState(null);          // "you" | "opp" | null — triggers sword-slash flash
  const [roundWins,setRoundWins]=useState({you:0,opp:0}); // best-of-3 round score
  const [roundNum,setRoundNum]=useState(1);        // current round number
  const [matchFormat,setMatchFormat]=useState(3);  // total rounds: 1, 3, or 5 (best-of)
  const markerRef=useRef({dir:1,raf:null,active:false});
  const [popups,setPopups]=useState([]);
  const [anim,setAnim]=useState(null);
  const idRef=useRef((saved?.sessions?.reduce((m,s)=>Math.max(m,(s.id??0)+1),0)) ?? 0);
  // ─── Training log: one entry per logged class/competition ───
  const [sessions,setSessions]=useState(saved?.sessions ?? []);       // [{id, date, type, points, tags:[], note}]
  const [detailPrompt,setDetailPrompt]=useState(null); // session id awaiting optional tag/note detail, or null
  const [draftTags,setDraftTags]=useState([]);
  const [draftNote,setDraftNote]=useState("");
  const [showNoteBox,setShowNoteBox]=useState(false);
  const [draftBreakdown,setDraftBreakdown]=useState(DEFAULT_BREAKDOWN);
  // ─── Strength/conditioning logging (separate track — no warrior points) ───
  const [strengthModalOpen,setStrengthModalOpen]=useState(false);
  const [strengthType,setStrengthType]=useState("Lifting");
  const [strengthDuration,setStrengthDuration]=useState(45); // minutes
  // ─── Competition logging: requires naming the event + once-per-day cap ───
  const [compModalOpen,setCompModalOpen]=useState(false);
  const [compEventName,setCompEventName]=useState("");
  const [lastCompDateStr,setLastCompDateStr]=useState(saved?.lastCompDateStr ?? null);
  // ─── Schedule (editable) ───
  const [schedule,setSchedule]=useState(saved?.schedule ?? DEFAULT_SCHEDULE);
  // ─── Profile (name, belt, stripes) ───
  const [profileName,setProfileName]=useState(saved?.profileName ?? "");
  const [ownedPremium,setOwnedPremium]=useState(saved?.ownedPremium ?? []); // keys of purchased premium warriors
  const [belt,setBelt]=useState(saved?.belt ?? "white");
  const [stripes,setStripes]=useState(saved?.stripes ?? 0);
  const [now,setNow]=useState(new Date());
  const [lastClassLogStr,setLastClassLogStr]=useState(saved?.lastClassLogStr ?? null); // toDateString of last class logged, to hide the prompt after logging
  const [addDay,setAddDay]=useState(2);
  const [addStart,setAddStart]=useState("19:30");
  const [addEnd,setAddEnd]=useState("22:00");

  const warrior=warriorKey?WARRIORS[warriorKey]:null;
  const tierIndex=(warrior&&warrior.premium)?THRESHOLDS.length-1:THRESHOLDS.filter((t)=>points>=t).length-1;

  function addPopup(text,color){const id=idRef.current++;setPopups((p)=>[...p,{id,text,color:color||(warrior?warrior.accent:"#C9A15A")}]);setTimeout(()=>setPopups((p)=>p.filter((pu)=>pu.id!==id)),1300);}
  function triggerAnim(type,d=600){setAnim(type);setTimeout(()=>setAnim(null),d);}

  // Auto-unlock: whenever lifetime points, streak, or competition history change,
  // check if any locked warrior's milestone has now been met.
  useEffect(()=>{
    if(!warriorKey)return; // no unlocks until the quiz has given you a starting warrior
    if(newlyUnlocked)return; // don't stack unlock popups — wait until the current one is dismissed
    const startKey=unlockedWarriors[0]; // the quiz warrior is always the first unlocked
    if(!startKey)return;
    // Lifetime points for unlocks counts ONLY real training on base warriors —
    // premium warriors are bought & maxed, so their points must NOT count toward unlocks.
    const lifetime=BASE_ORDER.reduce((sum,k)=>sum+(warriorProgress[k]||0),0);
    const compCount=sessions.filter((s)=>s.type==="competition").length;
    const plan=unlockPlan(startKey);
    // Unlock at most ONE per pass, in order, so a big jump can't hand over a pile at once.
    for(const {key,req} of plan){
      if(unlockedWarriors.includes(key))continue;
      let met=false;
      if(req.type==="lifetime")met=lifetime>=req.value;
      else if(req.type==="competition")met=compCount>=req.value;
      if(met){
        setUnlockedWarriors((u)=>[...u,key]);
        setNewlyUnlocked(key);
        break;
      }
      // Stop at the first still-locked warrior: they unlock strictly in order.
      break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[warriorProgress,sessions,warriorKey,newlyUnlocked]);

  // Safety: make sure there's always a valid duel opponent once you have a warrior.
  // (Returning players load straight to home and skip the quiz that used to set this.)
  useEffect(()=>{
    if(warriorKey && (!oppKey || oppKey===warriorKey)){
      setOppKey(BASE_KEYS.find((k)=>k!==warriorKey)||"knight");
    }
  },[warriorKey,oppKey]);

  // Keep "now" fresh so the schedule status (upcoming/ongoing/done) updates on its own.
  useEffect(()=>{
    const id=setInterval(()=>setNow(new Date()),30000);
    return ()=>clearInterval(id);
  },[]);

  // Persist progression to localStorage whenever any of it changes.
  useEffect(()=>{
    writeSave({
      warriorKey, warriorProgress, unlockedWarriors, streak,
      record, sessions, lastCompDateStr, schedule, lastClassLogStr,
      profileName, belt, stripes, ownedPremium,
    });
  },[warriorKey,warriorProgress,unlockedWarriors,streak,record,sessions,lastCompDateStr,schedule,lastClassLogStr,profileName,belt,stripes,ownedPremium]);

  function setActiveWarrior(key){
    // A warrior is usable if it's unlocked (base) OR owned (premium).
    const usable = unlockedWarriors.includes(key) || ownedPremium.includes(key);
    if(!usable)return;
    setWarriorKey(key);
    setScreen("home");
  }
  function purchasePremium(key){
    // Mock purchase — no real payment yet. Unlocks the premium warrior as "owned & maxed."
    if(ownedPremium.includes(key))return;
    const w=WARRIORS[key];
    if(!window.confirm(`Unlock ${w.name} for ${w.price}?\n\n(Payments aren't live yet — this unlocks it for free so you can try it. Real checkout comes later.)`))return;
    setOwnedPremium((p)=>[...p,key]);
    // Premium warriors are maxed by their `premium` flag (tierIndex forces max tier) —
    // we deliberately do NOT give them points, so they never affect unlock milestones or stats.
    setNewlyUnlocked(key);
  }
  function goRoster(){setScreen("roster");}

  function startQuiz(){setQIndex(0);setTally({GW:0,PP:0,SC:0,SH:0,AN:0});setScreen("quiz");}
  function answer(a){const next={...tally,[a]:tally[a]+1};if(qIndex+1<QUESTIONS.length){setTally(next);setQIndex(qIndex+1);}else{let best="GW",bs=-1;Object.keys(next).forEach((k)=>{if(next[k]>bs){bs=next[k];best=k;}});setTally(next);const wk=ARCH_MAP[best];setWarriorKey(wk);setUnlockedWarriors([wk]);setOppKey(BASE_KEYS.find((k)=>k!==wk)||"knight");setScreen("reveal");setTimeout(()=>setRevealed(true),80);}}
  function goHome(){setScreen("home");}
  function goProfileSetup(){setScreen("profileSetup");}
  function goProfile(){setScreen("profile");}
  function goDuel(){stopMarker();setDuelPhase("idle");setDuelResult(null);setHpYou(100);setHpOpp(100);setDuelLog("");setLockedZone(null);setHomeField(null);setRoundWins({you:0,opp:0});setRoundNum(1);setScreen("duel");}
  function goShop(){setScreen("shop");}
  function goBoard(){setScreen("board");}
  function goHistory(){setScreen("history");}
  function goMore(){setScreen("more");}
  function resetProgress(){
    if(!window.confirm("Reset everything? Your warrior, points, roster, and training log will be permanently wiped."))return;
    clearSave();
    setWarriorKey(null);
    setWarriorProgress({mongol:0,knight:0,viking:0,samurai:0,spartan:0});
    setUnlockedWarriors([]);
    setOwnedPremium([]);
    setNewlyUnlocked(null);
    setStreak(0);
    setRecord({w:0,l:0});
    setSessions([]);
    setLastCompDateStr(null);
    setLastClassLogStr(null);
    setSchedule(DEFAULT_SCHEDULE);
    setProfileName("");
    setBelt("white");
    setStripes(0);
    setScreen("intro");
  }
  function gain(amount,label){const before=points,bT=THRESHOLDS.filter((t)=>before>=t).length-1;const after=before+amount,aT=THRESHOLDS.filter((t)=>after>=t).length-1;setWarriorProgress((p)=>({...p,[warriorKey]:after}));addPopup(label);triggerAnim("celebrate",900);if(aT>bT){setTimeout(()=>setScreen("evolve"),500);setTimeout(()=>setScreen("home"),2800);}}
  function addSession(points,type,extra={}){
    const id=idRef.current++;
    const entry={id,date:new Date().toISOString(),type,points,tags:[],note:"",eventName:"",...extra};
    setSessions((s)=>[entry,...s]);
    // Only BJJ classes/comps get the optional technique-tag prompt.
    if(type==="class"||type==="competition"){
      setDetailPrompt(id);setDraftTags([]);setDraftNote("");setShowNoteBox(false);setDraftBreakdown(DEFAULT_BREAKDOWN);
    }
  }
  function logClass(){gain(1,"+1 point");setStreak((s)=>s+1);addSession(1,"class");setLastClassLogStr(new Date().toDateString());}
  function openStrengthModal(){setStrengthType("Lifting");setStrengthDuration(45);setStrengthModalOpen(true);}
  function confirmStrength(){
    // Strength sessions are tracked but award NO warrior points — keeps rank BJJ-only.
    addSession(0,"strength",{strengthType,durationMin:strengthDuration});
    setStrengthModalOpen(false);
    addPopup("💪 Strength logged","#6A9EE8");
  }
  function goSchedule(){setScreen("schedule");}
  function addClass(){
    if(addEnd<=addStart)return;
    setSchedule((s)=>[...s,{day:addDay,start:addStart,end:addEnd}].sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start)));
  }
  function removeClass(idx){
    setSchedule((s)=>s.filter((_,i)=>i!==idx));
  }
  function exportCalendar(){
    if(schedule.length===0)return;
    // iCalendar day codes for RRULE (weekly recurrence)
    const ICS_DAY=["SU","MO","TU","WE","TH","FR","SA"];
    const pad=(n)=>String(n).padStart(2,"0");
    // Find the next occurrence of a given weekday from today (for DTSTART)
    const nextDateFor=(dow)=>{
      const d=new Date();
      d.setHours(0,0,0,0);
      const diff=(dow-d.getDay()+7)%7;
      d.setDate(d.getDate()+diff);
      return d;
    };
    const fmt=(date,hhmm)=>{
      const [h,m]=hhmm.split(":").map(Number);
      return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(h)}${pad(m)}00`;
    };
    const stamp=(()=>{const n=new Date();return `${n.getUTCFullYear()}${pad(n.getUTCMonth()+1)}${pad(n.getUTCDate())}T${pad(n.getUTCHours())}${pad(n.getUTCMinutes())}${pad(n.getUTCSeconds())}Z`;})();
    let lines=[
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Roll Card//BJJ Schedule//EN","CALSCALE:GREGORIAN",
    ];
    schedule.forEach((s,i)=>{
      const base=nextDateFor(s.day);
      lines.push(
        "BEGIN:VEVENT",
        `UID:rollcard-${i}-${s.day}-${s.start.replace(":","")}@rollcard`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${fmt(base,s.start)}`,
        `DTEND:${fmt(base,s.end)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${ICS_DAY[s.day]}`,
        "SUMMARY:BJJ Class",
        "DESCRIPTION:Training session — log it in Roll Card after class!",
        "BEGIN:VALARM","TRIGGER:-PT1H","ACTION:DISPLAY","DESCRIPTION:BJJ Class in 1 hour","END:VALARM",
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download="bjj-schedule.ics";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    addPopup("Calendar file ready","#5AB48C");
  }
  function openCompModal(){
    if(lastCompDateStr){
      const daysSince=(Date.now()-new Date(lastCompDateStr).getTime())/(1000*60*60*24);
      if(daysSince<7){
        const daysLeft=Math.ceil(7-daysSince);
        addPopup(`Wait ${daysLeft} more day${daysLeft!==1?"s":""}`,"#B33A3A");
        return;
      }
    }
    setCompEventName("");
    setCompModalOpen(true);
  }
  function confirmComp(){
    const name=compEventName.trim();
    if(!name)return;
    setLastCompDateStr(new Date().toISOString());
    setCompModalOpen(false);
    gain(5,"+5 points");
    setStreak((s)=>s+1);
    addSession(5,"competition",{eventName:name});
  }
  function toggleTag(tag){setDraftTags((t)=>t.includes(tag)?t.filter((x)=>x!==tag):[...t,tag]);}
  function saveDetails(){setSessions((all)=>all.map((s)=>s.id===detailPrompt?{...s,tags:draftTags,note:draftNote,breakdown:s.type==="class"?draftBreakdown:undefined}:s));setDetailPrompt(null);}
  function skipDetails(){setSessions((all)=>all.map((s)=>s.id===detailPrompt&&s.type==="class"?{...s,breakdown:DEFAULT_BREAKDOWN}:s));setDetailPrompt(null);}
  function tapWarrior(){if(anim)return;triggerAnim("attack",500);addPopup("⚔",warrior.accent);}

  // ─── Interactive duel: timing-bar engine ───
  // Rank sets the base sweet-spot width and damage; each warrior line then nudges
  // those numbers slightly to match its personality (see WARRIOR_BALANCE above).
  const myTier=tierIndex;
  // Home-field: if the duel is on YOUR turf, your timing zones get a small bump.
  const HOME_BONUS = 2.5; // extra half-width added to both zones on home turf
  function zoneFor(tier,phase,forKey){
    // half-width of the "good" and "perfect" zones, centered at 50
    let perfect=6+tier*1.2;   // e.g. tier0=6, tier3=9.6
    let good=16+tier*2;       // wider normal-hit band
    if(homeField==="you"){ perfect+=HOME_BONUS; good+=HOME_BONUS; }
    const bal=WARRIOR_BALANCE[forKey]||{};
    const mod=phase==="attack"?(bal.attackZoneMod||0):(bal.defendZoneMod||0);
    perfect=Math.max(2,perfect+mod);
    good=Math.max(perfect+4,good+mod);
    return {perfect,good};
  }
  function baseDmg(tier,forKey){
    const bal=WARRIOR_BALANCE[forKey]||{};
    return 16+tier*3+(bal.dmgMod||0);
  }
  // Rounds a player needs to win the whole match.
  const roundsToWin = Math.ceil(matchFormat/2);
  // Is the current round a "decider"? (both players one win from taking the match,
  // or a single-round match, or match point in general) — these ramp up in difficulty.
  function isDecider(){
    if(matchFormat===1) return true;
    return roundWins.you===roundsToWin-1 && roundWins.opp===roundsToWin-1;
  }
  function markerSpeed(forKey){
    const bal=WARRIOR_BALANCE[forKey]||{};
    const roundBoost = isDecider() ? 1.3 : 0; // decider is faster
    return 1.9 + oppTier*0.28 + (bal.speedMod||0) + roundBoost;
  }
  function roundZonePenalty(){ return isDecider() ? 3 : 0; }
  function roundDmgMult(){ return isDecider() ? 1.25 : 1; }

  function stopMarker(){
    markerRef.current.active=false;
    if(markerRef.current.raf) cancelAnimationFrame(markerRef.current.raf);
    markerRef.current.raf=null;
  }
  function startMarker(speed){
    stopMarker();
    markerRef.current={dir:1,raf:null,active:true};
    const step=()=>{
      if(!markerRef.current.active) return;
      setMarkerPos((p)=>{
        let np=p+markerRef.current.dir*speed;
        if(np>=100){np=100;markerRef.current.dir=-1;}
        if(np<=0){np=0;markerRef.current.dir=1;}
        return np;
      });
      markerRef.current.raf=requestAnimationFrame(step);
    };
    markerRef.current.raf=requestAnimationFrame(step);
  }

  function startDuel(){
    // Fresh best-of-3 match
    setRoundWins({you:0,opp:0});
    setRoundNum(1);
    setDuelResult(null);
    // Randomly decide whose home turf we fight on (adds variety) — set once per match.
    const home=Math.random()<0.5?"you":"opp";
    setHomeField(home);
    startRound(1, home);
  }
  function startRound(num, home){
    setHpYou(100);setHpOpp(100);
    setLockedZone(null);setMarkerPos(0);
    const fieldName = home==="you" ? warrior.name : WARRIORS[oppKey].name;
    const decider = isDecider();
    const roundLabel = decider ? "DECIDER — faster & tighter!" : (matchFormat===1?"One round — winner takes all":`Round ${num}`);
    setDuelLog(`${roundLabel}${num===1&&!decider?` · ${fieldName}'s home field`:""} — your attack, tap center!`);
    setDuelPhase("attack");
    startMarker(markerSpeed(warriorKey));
  }

  // Judge where the marker landed relative to center (50)
  function judge(tier,phase,forKey){
    let {perfect,good}=zoneFor(tier,phase,forKey);
    const pen=roundZonePenalty();
    perfect=Math.max(2,perfect-pen);
    good=Math.max(perfect+3,good-pen);
    const d=Math.abs(markerPos-50);
    if(d<=perfect) return "perfect";
    if(d<=good) return "good";
    return "miss";
  }

  function onTap(){
    if(duelPhase==="attack"){
      stopMarker();
      const res=judge(myTier,"attack",warriorKey);
      setLockedZone({result:res,at:markerPos});
      const myBal=WARRIOR_BALANCE[warriorKey]||{};
      const critMult=myBal.critMult||1.8;
      let dmg=0,line="";
      if(res==="perfect"){dmg=Math.round(baseDmg(myTier,warriorKey)*critMult);line=`Critical hit! ${dmg} damage.`;setSlash("opp");setTimeout(()=>setSlash(null),450);}
      else if(res==="good"){dmg=baseDmg(myTier,warriorKey);line=`Clean strike — ${dmg} damage.`;}
      else {dmg=Math.round(baseDmg(myTier,warriorKey)*0.4);line=`Glancing blow, only ${dmg}.`;}
      if(myBal.dmgPctBonus){dmg=Math.round(dmg*(1+myBal.dmgPctBonus));}
      setHitFlash("opp");setTimeout(()=>setHitFlash(null),260);
      const newOpp=Math.max(0,hpOpp-dmg);
      setHpOpp(newOpp);
      setDuelLog(line);
      setDuelPhase("resolve");
      setTimeout(()=>{
        if(newOpp<=0){endRound(true);return;}
        // opponent attacks, you defend
        setDuelLog(`${WARRIORS[oppKey].name} attacks — tap to block!`);
        setLockedZone(null);setMarkerPos(0);
        setDuelPhase("defend");
        startMarker(markerSpeed(oppKey));
      },750);
    } else if(duelPhase==="defend"){
      stopMarker();
      const res=judge(myTier,"defend",warriorKey);
      setLockedZone({result:res,at:markerPos});
      // opponent's raw damage, reduced by how well you blocked.
      const oppBal=WARRIOR_BALANCE[oppKey]||{};
      let raw=baseDmg(oppTier,oppKey)+Math.round(Math.random()*6);
      if(oppBal.dmgPctBonus){raw=Math.round(raw*(1+oppBal.dmgPctBonus));}
      if(homeField==="opp") raw=Math.round(raw*1.2);
      raw=Math.round(raw*roundDmgMult()); // decider round hits harder
      let dmg=0,line="";
      if(res==="perfect"){dmg=0;line="Perfect block! No damage.";}
      else if(res==="good"){dmg=Math.round(raw*0.5);line=`Partial block — took ${dmg}.`;}
      else {dmg=raw;line=`Missed the block! Took ${dmg}.`;}
      if(dmg>0){setHitFlash("you");setTimeout(()=>setHitFlash(null),260);}
      const newYou=Math.max(0,hpYou-dmg);
      setHpYou(newYou);
      setDuelLog(line);
      setDuelPhase("resolve");
      setTimeout(()=>{
        if(newYou<=0){endRound(false);return;}
        setDuelLog("Your attack — tap in the center!");
        setLockedZone(null);setMarkerPos(0);
        setDuelPhase("attack");
        startMarker(markerSpeed(warriorKey));
      },750);
    }
  }

  // A round ended. Update round score; if someone hit 2 wins, the match is over.
  function endRound(youWonRound){
    stopMarker();
    const nextWins = youWonRound
      ? {you:roundWins.you+1, opp:roundWins.opp}
      : {you:roundWins.you, opp:roundWins.opp+1};
    setRoundWins(nextWins);
    if(nextWins.you>=roundsToWin || nextWins.opp>=roundsToWin){
      finishDuel(nextWins.you>=roundsToWin);
      return;
    }
    // Otherwise, briefly show the round result, then start the next round.
    const nextRoundNum = nextWins.you + nextWins.opp + 1;
    setDuelPhase("roundbreak");
    setDuelLog(youWonRound ? "You took the round!" : `${WARRIORS[oppKey].name} took the round.`);
    setTimeout(()=>{
      setRoundNum(nextRoundNum);
      startRound(nextRoundNum, homeField);
    },1600);
  }

  function finishDuel(win){
    stopMarker();
    const opp=WARRIORS[oppKey];
    setDuelResult({win,narration:win?warrior.winLine(opp.name):warrior.loseLine(opp.name)});
    setRecord((r)=>win?{...r,w:r.w+1}:{...r,l:r.l+1});
    setDuelPhase("result");
  }

  const nextThreshold=THRESHOLDS[tierIndex+1],prevThreshold=THRESHOLDS[tierIndex];
  const progressPct=nextThreshold?((points-prevThreshold)/(nextThreshold-prevThreshold))*100:100;
  const animStyle=anim==="attack"?{animation:"attackLunge 0.5s ease-out"}:anim==="celebrate"?{animation:"celebrate 0.9s ease-out"}:{animation:"idleBob 3s ease-in-out infinite"};

  // Bottom navigation bar — shown on the main screens. "More" holds secondary destinations.
  const NAV_ITEMS=[
    {key:"home",  label:"Home",  icon:"🏠", go:goHome},
    {key:"duel",  label:"Duel",  icon:"⚔️", go:goDuel},
    {key:"stats", label:"Stats", icon:"📊", go:()=>setScreen("stats")},
    {key:"roster",label:"Roster",icon:"🛡️", go:goRoster},
    {key:"more",  label:"More",  icon:"☰",  go:()=>setScreen("more")},
  ];
  const activeNav = screen==="home"?"home":screen==="duel"?"duel":screen==="stats"?"stats":screen==="roster"?"roster":["more","board","history","schedule","shop"].includes(screen)?"more":null;
  const navBar=(
    <div style={Z.navBar}>
      {NAV_ITEMS.map((n)=>(
        <button key={n.key} className="navbtn" onClick={n.go}
          style={{...Z.navItem,color:activeNav===n.key?(warrior?warrior.accent:"#C9A15A"):"#6B7580"}}>
          <span style={Z.navIcon}>{n.icon}</span>
          <span style={Z.navLabel}>{n.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={Z.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes floatUp{0%{opacity:0;transform:translateY(4px)}15%{opacity:1;transform:translateY(0)}75%{opacity:1;transform:translateY(-16px)}100%{opacity:0;transform:translateY(-26px)}}
        @keyframes cardIn{from{opacity:0;transform:scale(.88) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes burstIn{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
        @keyframes idleBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes attackLunge{0%{transform:translateX(0) scale(1)}30%{transform:translateX(16px) scale(1.08)}60%{transform:translateX(16px) scale(1.08)}100%{transform:translateX(0) scale(1)}}
        @keyframes celebrate{0%{transform:translateY(0) scale(1)}25%{transform:translateY(-12px) scale(1.1)}50%{transform:translateY(0) scale(1)}75%{transform:translateY(-6px) scale(1.05)}100%{transform:translateY(0) scale(1)}}
        @keyframes clash{0%,100%{transform:translateX(0)}30%{transform:translateX(8px)}70%{transform:translateX(-8px)}}
        @keyframes clashR{0%,100%{transform:translateX(0) scaleX(-1)}30%{transform:translateX(-8px) scaleX(-1)}70%{transform:translateX(8px) scaleX(-1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slashAcross{0%{opacity:0;transform:translateX(-60%) rotate(-25deg) scaleX(0.3)}25%{opacity:1;transform:translateX(-10%) rotate(-25deg) scaleX(1.1)}55%{opacity:1;transform:translateX(10%) rotate(-25deg) scaleX(1)}100%{opacity:0;transform:translateX(60%) rotate(-25deg) scaleX(0.3)}}
        @keyframes victoryPose{0%{transform:scale(1) translateY(0) rotate(0)}30%{transform:scale(1.18) translateY(-14px) rotate(-4deg)}55%{transform:scale(1.1) translateY(-6px) rotate(3deg)}100%{transform:scale(1.12) translateY(-8px) rotate(0)}}
        @keyframes defeatKneel{0%{transform:translateY(0) rotate(0) scale(1)}100%{transform:translateY(16px) rotate(8deg) scale(0.88)}}
        @keyframes glowBurst{0%{opacity:0.9;transform:scale(0.4)}100%{opacity:0;transform:scale(2.2)}}
        @keyframes poseEnter{0%{opacity:0;transform:scale(0.7) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        button{font-family:'Inter',sans-serif;cursor:pointer;border:none}
        .act:active{transform:scale(.97)}.stp:active{transform:scale(.9)}
        .navbtn{cursor:pointer;transition:opacity 0.15s}.navbtn:active{opacity:0.6}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
      `}</style>
      <div style={Z.phone}><div style={Z.notch}/><div style={Z.screen}>

      {screen==="intro"&&(
        <div style={Z.introWrap}>
          <div><div style={Z.kicker}>Roll Card</div><h1 style={Z.introTitle}>What's your game?</h1><p style={Z.introBody}>Six questions. One warrior. Level them up every time you show up to class — then duel your friends.</p></div>
          <div><button className="act" style={Z.primaryBtn} onClick={startQuiz}>Start the roll</button><p style={Z.fn}>Takes about a minute</p></div>
        </div>
      )}

      {screen==="quiz"&&(
        <div style={Z.quizWrap}>
          <div style={Z.stripeRow}>{Array.from({length:QUESTIONS.length}).map((_,i)=>(<div key={i} style={{...Z.stripe,background:i<qIndex?"#C9A15A":"rgba(255,255,255,0.12)"}}/>))}</div>
          <div style={Z.qCount}>Question {qIndex+1} of {QUESTIONS.length}</div>
          <h2 style={Z.quizQ}>{QUESTIONS[qIndex].q}</h2>
          <div style={Z.optCol}>{QUESTIONS[qIndex].options.map((opt,i)=>(<button key={i} className="act" style={Z.optBtn} onClick={()=>answer(opt.a)}>{opt.t}</button>))}</div>
        </div>
      )}

      {screen==="reveal"&&warrior&&(
        <div style={{...Z.revealWrap,animation:revealed?"cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards":"none",opacity:revealed?1:0}}>
          <div style={Z.revKicker}>Your warrior</div>
          <div style={{animation:"idleBob 3s ease-in-out infinite",textAlign:"center"}}><WarriorArt warriorKey={warriorKey} tier={0} scale={1} size={170}/></div>
          <h1 style={{...Z.revName,color:warrior.accent}}>{warrior.name}</h1>
          <p style={Z.revArch}>{warrior.archetype}</p>
          <p style={Z.revTag}>{warrior.tagline}</p>
          <p style={Z.revDesc}>{warrior.desc}</p>
          <button className="act" style={{...Z.primaryBtn,background:warrior.accent}} onClick={goProfileSetup}>Begin your journey</button>
        </div>
      )}

      {screen==="profileSetup"&&warrior&&(
        <div style={Z.profileWrap}>
          <div style={Z.profileKicker}>Set up your fighter card</div>
          <h2 style={Z.profileTitle}>Who are you on the mat?</h2>
          <p style={Z.profileSub}>You can change any of this later. Your belt is set by you — promotions are your coach's call.</p>

          <div style={Z.pfField}>
            <div style={Z.pfLabel}>Name</div>
            <input value={profileName} onChange={(e)=>setProfileName(e.target.value)} placeholder="Your name or nickname" style={Z.pfInput} maxLength={24}/>
          </div>

          <div style={Z.pfField}>
            <div style={Z.pfLabel}>Belt</div>
            <div style={Z.beltRow}>
              {BELTS.map((b)=>(
                <button key={b.key} className="stp" onClick={()=>{setBelt(b.key);if(b.key==="white"&&stripes>4)setStripes(4);}}
                  style={{...Z.beltChip,background:b.color,color:b.text,outline:belt===b.key?`3px solid ${warrior.accent}`:"none",outlineOffset:2}}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div style={Z.pfField}>
            <div style={Z.pfLabel}>Stripes</div>
            <div style={Z.stripeRow2}>
              {[0,1,2,3,4].map((n)=>(
                <button key={n} className="stp" onClick={()=>setStripes(n)}
                  style={{...Z.stripeChip,...(stripes===n?{background:warrior.accent,borderColor:warrior.accent,color:"#14181F"}:{})}}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Live belt preview */}
          <div style={Z.beltPreview}>
            <div style={{...Z.beltBar,background:beltOf(belt).color}}>
              <div style={Z.beltBlackBar}>
                {[0,1,2,3].map((i)=>(<div key={i} style={{...Z.beltStripe,opacity:i<stripes?1:0.15}}/>))}
              </div>
            </div>
            <div style={Z.beltPreviewLabel}>{beltOf(belt).name} Belt{stripes>0?` · ${stripes} stripe${stripes>1?"s":""}`:""}</div>
          </div>

          <button className="act" style={{...Z.primaryBtn,background:warrior.accent,marginTop:"auto"}} onClick={goHome}>Enter the app</button>
        </div>
      )}

      {screen==="profile"&&warrior&&(
        <div style={Z.profileWrap}>
          <button style={Z.backBtn} onClick={goMore}>← Back</button>
          <h2 style={Z.profileTitle}>Your Profile</h2>

          {/* Warrior + belt summary */}
          <div style={Z.profileSummary}>
            <div style={{width:64,height:64,flexShrink:0}}><WarriorArt warriorKey={warriorKey} tier={tierIndex} size={64}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{...Z.profileSumName,color:warrior.accent}}>{profileName||"Unnamed Fighter"}</div>
              <div style={Z.profileSumSub}>{warrior.name} · {warrior.titles[tierIndex]}</div>
            </div>
          </div>

          <div style={Z.beltPreview}>
            <div style={{...Z.beltBar,background:beltOf(belt).color}}>
              <div style={Z.beltBlackBar}>
                {[0,1,2,3].map((i)=>(<div key={i} style={{...Z.beltStripe,opacity:i<stripes?1:0.15}}/>))}
              </div>
            </div>
            <div style={Z.beltPreviewLabel}>{beltOf(belt).name} Belt{stripes>0?` · ${stripes} stripe${stripes>1?"s":""}`:""}</div>
          </div>

          <div style={Z.pfField}>
            <div style={Z.pfLabel}>Name</div>
            <input value={profileName} onChange={(e)=>setProfileName(e.target.value)} placeholder="Your name or nickname" style={Z.pfInput} maxLength={24}/>
          </div>
          <div style={Z.pfField}>
            <div style={Z.pfLabel}>Belt</div>
            <div style={Z.beltRow}>
              {BELTS.map((b)=>(
                <button key={b.key} className="stp" onClick={()=>setBelt(b.key)}
                  style={{...Z.beltChip,background:b.color,color:b.text,outline:belt===b.key?`3px solid ${warrior.accent}`:"none",outlineOffset:2}}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>
          <div style={Z.pfField}>
            <div style={Z.pfLabel}>Stripes</div>
            <div style={Z.stripeRow2}>
              {[0,1,2,3,4].map((n)=>(
                <button key={n} className="stp" onClick={()=>setStripes(n)}
                  style={{...Z.stripeChip,...(stripes===n?{background:warrior.accent,borderColor:warrior.accent,color:"#14181F"}:{})}}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen==="home"&&warrior&&(()=>{
        const bgUrl = BACKGROUNDS[warriorKey];
        const bgStyle = bgUrl
          ? { backgroundImage:`url(${optimize(bgUrl)})`, backgroundSize:"cover", backgroundPosition:"center" }
          : { background: BG_GRADIENT[warriorKey] };
        return (
        <div style={{height:"100%",position:"relative",...bgStyle}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(5,7,10,0.4) 0%, rgba(5,7,10,0.22) 35%, rgba(5,7,10,0.8) 100%)",pointerEvents:"none"}}/>
          <div style={{...Z.homeWrap,position:"relative",zIndex:1}}>
          <div style={Z.homeHead}>
            <div style={{...Z.archTag,color:warrior.accent}}>{warrior.archetype}</div>
            <div className="act" style={{...Z.streakTag,cursor:"pointer"}} onClick={goBoard}>🔥 {streak} wk streak</div>
            <div style={Z.ptsTag}>{warrior.premium?"⭐ MAX":`${points} pts`}</div>
          </div>
          {(()=>{
            const {today,todayState,next}=scheduleStatus(schedule, now);
            const loggedToday=lastClassLogStr===now.toDateString();
            // Ongoing or already-finished class today, not yet logged → one-tap prompt
            if(today&&(todayState==="ongoing"||todayState==="done")&&!loggedToday){
              return (
                <button className="act" style={{...Z.schedPrompt,background:warrior.accent}} onClick={logClass}>
                  {todayState==="ongoing"?"Class is on now":"Trained today?"} · Log it · +1
                </button>
              );
            }
            let text;
            if(today&&todayState==="upcoming") text=`Class today · ${to12h(today.start)}`;
            else if(loggedToday) text="✓ Logged today — nice work";
            else if(next) text=`Next class · ${next.ahead===0?"today":next.ahead===1?"tomorrow":DAY_NAMES[next.day]} ${to12h(next.start)}`;
            else text="No classes scheduled";
            return (
              <div className="act" style={Z.schedLine} onClick={goSchedule}>{text}</div>
            );
          })()}
          <div onClick={tapWarrior} style={{...animStyle,textAlign:"center",cursor:"pointer",userSelect:"none"}}><WarriorArt warriorKey={warriorKey} tier={tierIndex} scale={1} size={150}/></div>
          <p style={Z.tapHint}>Tap your warrior</p>
          <h1 style={{...Z.tierName,color:warrior.accent}}>{warrior.titles[tierIndex]}</h1>
          <div style={Z.wLabel}>{warrior.name}</div>
          <div style={Z.xpSec}>
            {warrior.premium ? (
              <div style={{...Z.xpRow,justifyContent:"center"}}><span style={{...Z.xpL,color:warrior.accent,fontWeight:700}}>⭐ Premium warrior · fully maxed</span></div>
            ) : (
              <>
                <div style={Z.xpRow}><span style={Z.xpL}>{nextThreshold?`Next: ${warrior.titles[tierIndex+1]}`:"Max rank"}</span><span style={Z.xpL}>{points}{nextThreshold?` / ${nextThreshold}`:""}</span></div>
                <div style={Z.xpTrack}><div style={{...Z.xpFill,width:`${progressPct}%`,background:warrior.accent}}/></div>
              </>
            )}
          </div>
          <div style={Z.homeFoot}>
            <button className="act" style={{...Z.primaryBtn,background:warrior.accent}} onClick={logClass}>Log a class · +1</button>
            <div style={{display:"flex",gap:8}}>
              <button className="act" style={{...Z.secBtn,flex:1}} onClick={openCompModal}>Competition · +5</button>
              <button className="act" style={{...Z.secBtn,flex:1,borderColor:"rgba(106,158,232,0.4)",color:"#6A9EE8"}} onClick={openStrengthModal}>💪 Strength</button>
            </div>
          </div>
          <div style={Z.popLayer}>{popups.map((p)=><div key={p.id} style={{...Z.popup,color:p.color}}>{p.text}</div>)}</div>
          </div>
          {navBar}
        </div>
        );
      })()}

      {screen==="evolve"&&warrior&&(
        <div style={Z.evoOverlay}><div style={{...Z.evoCard,animation:"burstIn 0.45s cubic-bezier(0.22,1,0.36,1)"}}>
          <div style={Z.evoKicker}>Your warrior evolved</div>
          <div style={{margin:"16px 0",animation:"celebrate 0.9s ease-out"}}><WarriorArt warriorKey={warriorKey} tier={tierIndex} scale={1} size={180}/></div>
          <div style={{...Z.evoTo,color:warrior.accent}}>{warrior.titles[tierIndex]}</div>
        </div></div>
      )}

      {newlyUnlocked&&warriorKey&&screen!=="intro"&&screen!=="quiz"&&screen!=="reveal"&&(
        <div style={Z.evoOverlay}><div style={{...Z.evoCard,animation:"burstIn 0.45s cubic-bezier(0.22,1,0.36,1)"}}>
          <div style={Z.evoKicker}>New warrior unlocked!</div>
          <div style={{margin:"16px 0"}}><WarriorArt warriorKey={newlyUnlocked} tier={0} scale={1.2} size={160}/></div>
          <div style={{...Z.evoTo,color:WARRIORS[newlyUnlocked].accent}}>{WARRIORS[newlyUnlocked].name}</div>
          <button className="act" style={{...Z.primaryBtn,background:WARRIORS[newlyUnlocked].accent,marginTop:18,width:200}} onClick={()=>setNewlyUnlocked(null)}>Nice!</button>
        </div></div>
      )}

      {screen==="duel"&&warrior&&oppKey&&(()=>{
        const opp=WARRIORS[oppKey];
        const active=duelPhase==="attack"||duelPhase==="defend";
        const clashing=duelPhase==="resolve";
        const inMatch=["attack","defend","resolve","roundbreak"].includes(duelPhase);
        const isAttack=duelPhase==="attack";
        const {perfect,good}=zoneFor(myTier,isAttack?"attack":"defend",warriorKey);
        // Whose field are we on? During the fight, the home fighter's line sets the scene.
        const fieldLine = homeField==="opp" ? oppKey : warriorKey;
        const bgUrl = BACKGROUNDS[fieldLine];
        const bgStyle = bgUrl
          ? { backgroundImage:`url(${optimize(bgUrl)})`, backgroundSize:"cover", backgroundPosition:"center" }
          : { background: BG_GRADIENT[fieldLine] };
        const showField = duelPhase!=="idle";
        return (
          <div style={Z.duelWrap} onClick={active?onTap:undefined}>
            <button style={Z.backBtn} onClick={(e)=>{e.stopPropagation();stopMarker();goHome();}}>← Back</button>
            <div style={Z.recRow}><span style={Z.recText}>{record.w}W — {record.l}L</span></div>

            {/* Best-of-N round score */}
            {inMatch&&matchFormat>1&&(
              <div style={Z.roundScoreRow}>
                <div style={Z.roundDots}>
                  {Array.from({length:roundsToWin}).map((_,i)=><div key={"y"+i} style={{...Z.roundDot,background:i<roundWins.you?warrior.accent:"rgba(255,255,255,0.15)"}}/>)}
                </div>
                <span style={{...Z.roundLabel,color:isDecider()?"#E85A3A":"#8B95A3"}}>{isDecider()?"DECIDER":`Round ${roundNum}`}</span>
                <div style={Z.roundDots}>
                  {Array.from({length:roundsToWin}).map((_,i)=><div key={"o"+i} style={{...Z.roundDot,background:i<roundWins.opp?opp.accent:"rgba(255,255,255,0.15)"}}/>)}
                </div>
              </div>
            )}

            {/* HP bars */}
            <div style={{display:"flex",gap:12,marginBottom:8}}>
              <div style={{flex:1}}><div style={{fontSize:10,color:"#8B95A3",marginBottom:3}}>You</div><div style={Z.hpTrack}><div style={{...Z.hpFill,width:`${hpYou}%`,background:warrior.accent,transition:"width 0.35s ease-out"}}/></div></div>
              <div style={{flex:1}}><div style={{fontSize:10,color:"#8B95A3",marginBottom:3,textAlign:"right"}}>{opp.name.split(" ")[0]}</div><div style={Z.hpTrack}><div style={{...Z.hpFill,width:`${hpOpp}%`,background:opp.accent,transition:"width 0.35s ease-out"}}/></div></div>
            </div>

            {/* Fighters on the home-field background */}
            <div style={{...Z.arena,...(showField?bgStyle:{background:"transparent"}),borderRadius:16,padding:"12px 8px 8px",position:"relative",overflow:"hidden",transition:"background 0.4s"}}>
              {showField&&<div style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(5,7,10,0.15), rgba(5,7,10,0.55))",pointerEvents:"none"}}/>}
              {showField&&(
                <div style={{position:"absolute",top:8,left:0,right:0,textAlign:"center",zIndex:2}}>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:0.5,color:"#EDEFF2",background:homeField==="you"?`${warrior.accent}cc`:`${opp.accent}cc`,padding:"2px 10px",borderRadius:20}}>
                    {(homeField==="you"?warrior.name:opp.name)} home field
                  </span>
                </div>
              )}
              <div style={{...Z.fCol,position:"relative",zIndex:1}}>
                {duelPhase==="result"?(
                  <div style={{position:"relative"}}>
                    <PoseArt warriorKey={warriorKey} won={!!duelResult?.win} tier={myTier} size={104}/>
                    {duelResult?.win&&<div style={{position:"absolute",inset:-20,borderRadius:"50%",background:`radial-gradient(circle, ${warrior.accent}99 0%, transparent 70%)`,animation:"glowBurst 0.9s ease-out",pointerEvents:"none",zIndex:-1}}/>}
                  </div>
                ):(
                  <div style={{position:"relative",animation:clashing?"clash 0.4s":"idleBob 3s ease-in-out infinite",filter:hitFlash==="you"?"brightness(2) sepia(1) hue-rotate(-40deg)":"none"}}>
                    <WarriorArt warriorKey={warriorKey} tier={myTier} size={104}/>
                    {slash==="you"&&<div style={{position:"absolute",top:"20%",left:"-30%",right:"-30%",height:6,background:"linear-gradient(90deg, transparent, #fff, transparent)",boxShadow:"0 0 12px 3px #fff",animation:"slashAcross 0.45s ease-out",pointerEvents:"none"}}/>}
                  </div>
                )}
                <div style={{...Z.fLbl,color:"#EDEFF2"}}>{warrior.titles[myTier]}</div>
              </div>
              <div style={{...Z.vs,position:"relative",zIndex:1}}>{active?"⚔":"VS"}</div>
              <div style={{...Z.fCol,position:"relative",zIndex:1}}>
                {duelPhase==="result"?(
                  <div style={{position:"relative"}}>
                    <PoseArt warriorKey={oppKey} won={!duelResult?.win} tier={oppTier} flip size={104}/>
                    {!duelResult?.win&&<div style={{position:"absolute",inset:-20,borderRadius:"50%",background:`radial-gradient(circle, ${opp.accent}99 0%, transparent 70%)`,animation:"glowBurst 0.9s ease-out",pointerEvents:"none",zIndex:-1}}/>}
                  </div>
                ):(
                  <div style={{position:"relative",transform:"scaleX(-1)",animation:clashing?"clashR 0.4s":"idleBob 3s ease-in-out infinite",filter:hitFlash==="opp"?"brightness(2) sepia(1) hue-rotate(-40deg)":"none"}}>
                    <WarriorArt warriorKey={oppKey} tier={oppTier} size={104}/>
                    {slash==="opp"&&<div style={{position:"absolute",top:"20%",left:"-30%",right:"-30%",height:6,background:"linear-gradient(90deg, transparent, #fff, transparent)",boxShadow:"0 0 12px 3px #fff",animation:"slashAcross 0.45s ease-out",pointerEvents:"none"}}/>}
                  </div>
                )}
                <div style={{...Z.fLbl,color:"#EDEFF2"}}>{opp.titles[oppTier]}</div>
              </div>
            </div>

            {/* Pre-fight setup (idle only) */}
            {duelPhase==="idle"&&(<>
              <div style={Z.oppTabs}>{Object.entries(WARRIORS).filter(([k])=>k!==warriorKey&&!WARRIORS[k].premium).map(([key,w])=>(<button key={key} className="stp" onClick={()=>{setOppKey(key);}} style={{...Z.tab,borderColor:oppKey===key?w.accent:"rgba(255,255,255,0.1)",color:oppKey===key?w.accent:"#5D6673"}}>{w.name.split(" ")[0]}</button>))}</div>
              <div style={Z.stepperRow}><span style={Z.stepText}>Opponent rank</span><button className="stp" style={Z.stepBtn} onClick={()=>setOppTier((t)=>Math.max(0,t-1))}>−</button><span style={Z.stepText}>{oppTier+1}</span><button className="stp" style={Z.stepBtn} onClick={()=>setOppTier((t)=>Math.min(3,t+1))}>+</button></div>
              <div style={Z.formatLabel}>Match length</div>
              <div style={Z.formatSeg}>
                {[{v:1,l:"1 Round"},{v:3,l:"Best of 3"},{v:5,l:"Best of 5"}].map((f)=>(
                  <button key={f.v} className="stp" onClick={()=>setMatchFormat(f.v)}
                    style={{...Z.formatSegBtn,...(matchFormat===f.v?{background:warrior.accent,color:"#14181F"}:{})}}>
                    {f.l}
                  </button>
                ))}
              </div>
            </>)}

            {/* Timing bar (during attack/defend/resolve) */}
            {(active||clashing)&&(
              <div style={{margin:"4px 0 10px"}}>
                <div style={{...Z.duelLog,color:isAttack?warrior.accent:opp.accent}}>{duelLog}</div>
                <div style={Z.timingTrack}>
                  {/* good zone */}
                  <div style={{position:"absolute",top:0,bottom:0,left:`${50-good}%`,width:`${good*2}%`,background:"rgba(90,180,140,0.18)"}}/>
                  {/* perfect zone */}
                  <div style={{position:"absolute",top:0,bottom:0,left:`${50-perfect}%`,width:`${perfect*2}%`,background:"rgba(232,201,94,0.35)",borderLeft:"1px solid rgba(232,201,94,0.6)",borderRight:"1px solid rgba(232,201,94,0.6)"}}/>
                  {/* center line */}
                  <div style={{position:"absolute",top:0,bottom:0,left:"50%",width:2,background:"rgba(255,255,255,0.5)",transform:"translateX(-1px)"}}/>
                  {/* marker */}
                  <div style={{position:"absolute",top:-3,bottom:-3,left:`${lockedZone?lockedZone.at:markerPos}%`,width:4,borderRadius:2,background:lockedZone?(lockedZone.result==="perfect"?"#E8C95E":lockedZone.result==="good"?"#5AB48C":"#B33A3A"):"#FFFFFF",transform:"translateX(-2px)",boxShadow:"0 0 8px rgba(255,255,255,0.6)"}}/>
                </div>
                <div style={Z.timingHint}>{active?"TAP ANYWHERE to lock":(lockedZone?lockedZone.result.toUpperCase():"")}</div>
                {active&&<div style={Z.tapAnywhereHint}>Tap anywhere on the screen</div>}
              </div>
            )}

            {/* Between-rounds banner */}
            {duelPhase==="roundbreak"&&(
              <div style={{...Z.roundBreak,animation:"fadeIn 0.3s ease-out"}}>{duelLog}</div>
            )}

            {/* Result */}
            {duelPhase==="result"&&duelResult&&(<div key={record.w+record.l} style={{...Z.resBox,animation:"fadeIn 0.4s ease-out"}}><div style={{...Z.resBanner,color:duelResult.win?"#3E9B7F":"#B33A3A"}}>{duelResult.win?"Victory":"Defeat"}</div><p style={Z.narr}>{duelResult.narration}</p><div style={Z.finalScore}>Rounds: {roundWins.you}–{roundWins.opp}</div></div>)}

            {/* Action button */}
            <div style={{marginTop:"auto"}}>
              {duelPhase==="idle"&&<button className="act" style={Z.duelBtn} onClick={startDuel}>Start Duel · {matchFormat===1?"1 Round":`Best of ${matchFormat}`}</button>}
              {(active||clashing)&&<div style={Z.rankNote}>Win 2 rounds to take the duel. The decider is faster & tighter.</div>}
              {duelPhase==="result"&&<button className="act" style={Z.duelBtn} onClick={()=>{setDuelPhase("idle");setDuelResult(null);setHpYou(100);setHpOpp(100);setDuelLog("");setLockedZone(null);setRoundWins({you:0,opp:0});setRoundNum(1);}}>Rematch</button>}
              <p style={Z.fn}>For fun — no training points at stake</p>
            </div>
          </div>
        );
      })()}

      {screen==="board"&&warrior&&(()=>{
        const you={name:"You",line:warriorKey,points,streak,verified:false,isYou:true};
        const all=[...GYM_MEMBERS,you].sort((a,b)=>b.points-a.points);
        return (
          <div style={Z.boardWrap}>
            <button style={Z.backBtn} onClick={goMore}>← Back</button>
            <h2 style={Z.boardTitle}>Gym Leaderboard</h2>
            <p style={Z.boardSub}>{GYM_NAME} · this month</p>
            <div style={Z.boardList}>
              {all.map((m,i)=>{
                const w=WARRIORS[m.line];
                return (
                  <div key={m.name} style={{...Z.boardRow,...(m.isYou?{background:"rgba(201,161,90,0.12)",border:`1px solid ${warrior.accent}`}:{})}}>
                    <div style={{...Z.boardRank,color:i<3?"#E8C95E":"#5D6673"}}>{i+1}</div>
                    <div style={{width:34,height:34,borderRadius:9,overflow:"hidden",flexShrink:0,background:"#05070A",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${w.accent}44`}}>
                      <WarriorArt warriorKey={m.line} tier={THRESHOLDS.filter((t)=>m.points>=t).length-1} size={34}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={Z.boardName}>{m.name}{m.isYou?"":""} {m.verified&&<span style={Z.verBadge}>✓ verified</span>}</div>
                      <div style={Z.boardMeta}>{w.titles[THRESHOLDS.filter((t)=>m.points>=t).length-1]} · 🔥{m.streak}</div>
                    </div>
                    <div style={{...Z.boardPts,color:m.isYou?warrior.accent:"#EDEFF2"}}>{m.points}</div>
                  </div>
                );
              })}
            </div>
            <p style={Z.boardFoot}>✓ verified = attendance confirmed by the gym's check-in. Self-logged training counts too, but only verified logs earn the badge.</p>
          </div>
        );
      })()}

      {screen==="stats"&&warrior&&(()=>{
        const bjjSessions=sessions.filter((s)=>s.type==="class"||s.type==="competition");
        const totalSessions=bjjSessions.length;
        const classCount=sessions.filter((s)=>s.type==="class").length;
        const compCount=sessions.filter((s)=>s.type==="competition").length;
        const strengthSessions=sessions.filter((s)=>s.type==="strength");
        const strengthCount=strengthSessions.length;
        const strengthMins=strengthSessions.reduce((a,s)=>a+(s.durationMin||0),0);
        // Sessions in the last 7 days (all types)
        const weekAgo=Date.now()-7*24*60*60*1000;
        const thisWeek=sessions.filter((s)=>new Date(s.date).getTime()>=weekAgo).length;
        // Sessions this calendar month
        const nowD=new Date();
        const thisMonth=sessions.filter((s)=>{const d=new Date(s.date);return d.getMonth()===nowD.getMonth()&&d.getFullYear()===nowD.getFullYear();}).length;
        // Tag tally → most-landed techniques
        const tagCounts={};
        sessions.forEach((s)=>(s.tags||[]).forEach((t)=>{tagCounts[t]=(tagCounts[t]||0)+1;}));
        const topTags=Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const maxTag=topTags.length?topTags[0][1]:1;
        const lifetime=BASE_ORDER.reduce((sum,k)=>sum+(warriorProgress[k]||0),0);
        const totalDuels=record.w+record.l;
        const winPct=totalDuels?Math.round((record.w/totalDuels)*100):0;
        // All-time BJJ time breakdown (from class breakdowns)
        const bd=sessions.reduce((acc,s)=>{
          if(s.type==="class"&&s.breakdown){
            acc.warmup+=s.breakdown.warmup||0;
            acc.drilling+=s.breakdown.drilling||0;
            acc.rolling+=s.breakdown.rolling||0;
          }
          return acc;
        },{warmup:0,drilling:0,rolling:0});
        const bdTotal=bd.warmup+bd.drilling+bd.rolling;
        const fmtHrs=(m)=>{const h=Math.floor(m/60);const mm=m%60;return h>0?`${h}h ${mm}m`:`${mm}m`;};
        return (
          <div style={Z.statsWrap}>
            <h2 style={Z.statsTitle}>Your Stats</h2>
            <p style={Z.statsSub}>Everything you've logged, at a glance.</p>

            {/* Top metric grid */}
            <div style={Z.statsGrid}>
              <div style={Z.statCard}><div style={{...Z.statNum,color:warrior.accent}}>{totalSessions}</div><div style={Z.statLbl}>BJJ sessions</div></div>
              <div style={Z.statCard}><div style={{...Z.statNum,color:"#E8935A"}}>🔥 {streak}</div><div style={Z.statLbl}>Week streak</div></div>
              <div style={Z.statCard}><div style={{...Z.statNum,color:"#6A9EE8"}}>{thisWeek}</div><div style={Z.statLbl}>Last 7 days</div></div>
              <div style={Z.statCard}><div style={{...Z.statNum,color:"#5AB48C"}}>{thisMonth}</div><div style={Z.statLbl}>This month</div></div>
              <div style={Z.statCard}><div style={{...Z.statNum,color:"#C9A15A"}}>{compCount}</div><div style={Z.statLbl}>Competitions</div></div>
              <div style={Z.statCard}><div style={{...Z.statNum,color:"#8B9EE8"}}>{strengthCount}</div><div style={Z.statLbl}>Strength{strengthMins>0?` · ${strengthMins}m`:""}</div></div>
            </div>

            {/* All-time mat time breakdown */}
            <div style={Z.statsSection}>
              <div style={Z.statsSectionTitle}>All-Time Mat Time</div>
              {bdTotal===0 ? (
                <div style={Z.statsEmpty}>Log a class to start tracking your warm-up, drilling, and rolling time.</div>
              ) : (
                <>
                  <div style={Z.matTotalRow}>{fmtHrs(bdTotal)} <span style={Z.matTotalSub}>total on the mat</span></div>
                  {[["rolling","Live rolling","#B33A3A"],["drilling","Drilling","#C9A15A"],["warmup","Warm-up","#5AB48C"]].map(([k,label,col])=>(
                    <div key={k} style={Z.tagBarRow}>
                      <span style={Z.tagBarLabel}>{label}</span>
                      <div style={Z.tagBarTrack}><div style={{...Z.tagBarFill,width:`${bdTotal?(bd[k]/bdTotal)*100:0}%`,background:col}}/></div>
                      <span style={{...Z.tagBarCount,width:48}}>{fmtHrs(bd[k])}</span>
                    </div>
                  ))}
                  <div style={Z.matNote}>Live rolling is the number that matters most — that's real mat time.</div>
                </>
              )}
            </div>

            {/* Duel record */}
            <div style={Z.statsSection}>
              <div style={Z.statsSectionTitle}>Duel Record</div>
              <div style={Z.duelRecordRow}>
                <span style={{color:"#3E9B7F",fontWeight:700}}>{record.w}W</span>
                <span style={{color:"#8B95A3"}}>–</span>
                <span style={{color:"#B33A3A",fontWeight:700}}>{record.l}L</span>
                {totalDuels>0&&<span style={Z.winPct}>· {winPct}% win rate</span>}
              </div>
            </div>

            {/* Signature techniques */}
            <div style={Z.statsSection}>
              <div style={Z.statsSectionTitle}>Signature Techniques</div>
              {topTags.length===0 ? (
                <div style={Z.statsEmpty}>Tag techniques when you log a class to see your top moves here.</div>
              ) : (
                <div style={Z.tagBars}>
                  {topTags.map(([tag,count])=>(
                    <div key={tag} style={Z.tagBarRow}>
                      <span style={Z.tagBarLabel}>{tag}</span>
                      <div style={Z.tagBarTrack}><div style={{...Z.tagBarFill,width:`${(count/maxTag)*100}%`,background:warrior.accent}}/></div>
                      <span style={Z.tagBarCount}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {navBar}
          </div>
          );
      })()}

      {screen==="more"&&warrior&&(
        <div style={Z.moreWrap}>
          <h2 style={Z.moreTitle}>More</h2>
          <div style={Z.moreList}>
            <button className="act" style={Z.moreItem} onClick={goProfile}>
              <span style={{...Z.moreItemIcon,color:beltOf(belt).color==="#E8E8E8"?"#B7BFC9":beltOf(belt).color}}>🥋</span>
              <div style={{flex:1,textAlign:"left"}}><div style={Z.moreItemName}>{profileName||"Your Profile"}</div><div style={Z.moreItemSub}>{beltOf(belt).name} belt{stripes>0?` · ${stripes} stripe${stripes>1?"s":""}`:""}</div></div>
              <span style={Z.moreChevron}>›</span>
            </button>
            <button className="act" style={Z.moreItem} onClick={goBoard}>
              <span style={{...Z.moreItemIcon,color:"#5AB48C"}}>🏆</span>
              <div style={{flex:1,textAlign:"left"}}><div style={Z.moreItemName}>Leaderboard</div><div style={Z.moreItemSub}>See where you rank at your gym</div></div>
              <span style={Z.moreChevron}>›</span>
            </button>
            <button className="act" style={Z.moreItem} onClick={goHistory}>
              <span style={{...Z.moreItemIcon,color:"#6A9EE8"}}>📓</span>
              <div style={{flex:1,textAlign:"left"}}><div style={Z.moreItemName}>Training Log</div><div style={Z.moreItemSub}>Your logged sessions and notes</div></div>
              <span style={Z.moreChevron}>›</span>
            </button>
            <button className="act" style={Z.moreItem} onClick={goSchedule}>
              <span style={{...Z.moreItemIcon,color:"#E8935A"}}>📅</span>
              <div style={{flex:1,textAlign:"left"}}><div style={Z.moreItemName}>Schedule</div><div style={Z.moreItemSub}>Class times & add to calendar</div></div>
              <span style={Z.moreChevron}>›</span>
            </button>
            <button className="act" style={Z.moreItem} onClick={goShop}>
              <span style={{...Z.moreItemIcon,color:"#8B5FBF"}}>✨</span>
              <div style={{flex:1,textAlign:"left"}}><div style={Z.moreItemName}>Shop</div><div style={Z.moreItemSub}>Cosmetics — no pay-to-win</div></div>
              <span style={Z.moreChevron}>›</span>
            </button>
            <button className="act" style={Z.moreItem} onClick={resetProgress}>
              <span style={{...Z.moreItemIcon,color:"#B33A3A"}}>↺</span>
              <div style={{flex:1,textAlign:"left"}}><div style={Z.moreItemName}>Reset Progress</div><div style={Z.moreItemSub}>Wipe everything and start over</div></div>
              <span style={Z.moreChevron}>›</span>
            </button>
          </div>
          {navBar}
        </div>
      )}

      {screen==="schedule"&&warrior&&(
        <div style={Z.schedWrap}>
          <button style={Z.backBtn} onClick={goMore}>← Back</button>
          <h2 style={Z.schedTitle}>Class Schedule</h2>
          <p style={Z.schedSub}>Your gym's weekly class times. The home screen uses these to remind you and prompt one-tap logging.</p>
          <div style={Z.schedList}>
            {schedule.length===0 ? (
              <div style={Z.schedEmpty}>No classes yet — add your gym's times below.</div>
            ) : (
              schedule.map((s,i)=>(
                <div key={i} style={Z.schedRow}>
                  <div style={{flex:1}}>
                    <div style={Z.schedDay}>{DAY_NAMES[s.day]}</div>
                    <div style={Z.schedTime}>{to12h(s.start)} – {to12h(s.end)}</div>
                  </div>
                  <button className="stp" style={Z.schedRemove} onClick={()=>removeClass(i)}>Remove</button>
                </div>
              ))
            )}
          </div>
          {schedule.length>0&&(
            <button className="act" style={Z.schedExportBtn} onClick={exportCalendar}>📅 Add to Calendar</button>
          )}
          <div style={Z.schedAddBox}>
            <div style={Z.schedAddLabel}>Add a class</div>
            <div style={Z.schedDayPicker}>
              {DAY_ABBR.map((d,i)=>(
                <button key={i} className="stp" onClick={()=>setAddDay(i)}
                  style={{...Z.schedDayChip,...(addDay===i?{background:warrior.accent,borderColor:warrior.accent,color:"#14181F"}:{})}}>
                  {d}
                </button>
              ))}
            </div>
            <div style={Z.schedTimeRow}>
              <div style={{flex:1}}>
                <div style={Z.schedTimeLabel}>Start</div>
                <input type="time" value={addStart} onChange={(e)=>setAddStart(e.target.value)} style={Z.schedTimeInput}/>
              </div>
              <div style={{flex:1}}>
                <div style={Z.schedTimeLabel}>End</div>
                <input type="time" value={addEnd} onChange={(e)=>setAddEnd(e.target.value)} style={Z.schedTimeInput}/>
              </div>
            </div>
            <button className="act" style={{...Z.schedAddBtn,background:warrior.accent,opacity:addEnd>addStart?1:0.5}} onClick={addClass} disabled={addEnd<=addStart}>Add class</button>
          </div>
        </div>
      )}

      {screen==="roster"&&warrior&&(
        <div style={Z.rosterWrap}>
          <h2 style={Z.rosterTitle}>Your Roster</h2>
          <p style={Z.rosterSub}>Only your active warrior earns points when you log training. Switch anytime — everyone's progress is saved.</p>
          <div style={Z.rosterList}>
            {Object.values(WARRIORS).sort((a,b)=>(a.premium?1:0)-(b.premium?1:0)).map((w)=>{
              const isPremium=!!w.premium;
              const owned=isPremium?ownedPremium.includes(w.key):unlockedWarriors.includes(w.key);
              const prog=warriorProgress[w.key]||0;
              const tIdx=isPremium?THRESHOLDS.length-1:THRESHOLDS.filter((t)=>prog>=t).length-1;
              const isActive=w.key===warriorKey;
              return (
                <div key={w.key} style={{...Z.rosterCard,...(isActive?{border:`1px solid ${w.accent}`,background:`${w.accent}14`}:{}),...(isPremium&&!owned?{border:"1px solid rgba(217,169,62,0.35)"}:{})}}>
                  <div style={{width:52,height:52,borderRadius:11,overflow:"hidden",flexShrink:0,filter:owned?"none":"grayscale(1) brightness(0.45)"}}>
                    <WarriorArt warriorKey={w.key} tier={owned?tIdx:(isPremium?THRESHOLDS.length-1:0)} size={52}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{...Z.rosterName,color:owned?w.accent:(isPremium?"#D9A93E":"#5D6673")}}>
                      {w.name}{isPremium&&<span style={Z.premiumTag}>PREMIUM</span>}
                    </div>
                    {owned?(
                      <div style={Z.rosterMeta}>{isPremium?"Maxed · unique playstyle":`${w.titles[tIdx]} · ${prog} pts`}</div>
                    ):isPremium?(
                      <div style={Z.rosterMeta}>{w.tagline}</div>
                    ):(
                      <div style={Z.rosterLocked}>🔒 {reqLabelFor(w.key, unlockedWarriors[0])||"Locked"}</div>
                    )}
                  </div>
                  {isPremium&&!owned&&(
                    <button className="act" style={{...Z.rosterBuyBtn}} onClick={()=>purchasePremium(w.key)}>{w.price}</button>
                  )}
                  {owned&&!isActive&&(
                    <button className="act" style={{...Z.rosterSwitchBtn,borderColor:w.accent,color:w.accent}} onClick={()=>setActiveWarrior(w.key)}>Switch</button>
                  )}
                  {isActive&&<div style={{...Z.rosterActiveTag,color:w.accent}}>Active</div>}
                </div>
              );
            })}
          </div>
          {navBar}
        </div>
      )}

      {screen==="shop"&&warrior&&(
        <div style={Z.shopWrap}>
          <button style={Z.backBtn} onClick={goMore}>← Back</button>
          <h2 style={Z.shopTitle}>Shop</h2>
          <p style={Z.shopSub}>Cosmetics only — no stat boosts, no pay-to-win</p>
          <div style={Z.shopGrid}>{SHOP_ITEMS.map((item)=>(<div key={item.id} style={Z.shopCard}><div style={{...Z.shopDot,background:item.color}}/><div style={{flex:1}}><div style={Z.shopName}>{item.name}</div><div style={Z.shopDesc}>{item.desc}</div></div><div style={{textAlign:"right"}}>{item.owned?<div style={Z.shopOwned}>Owned</div>:<button className="act" style={{...Z.shopBuyBtn,background:item.color}}>{item.price}</button>}</div></div>))}</div>
        </div>
      )}

      {screen==="history"&&warrior&&(
        <div style={Z.historyWrap}>
          <button style={Z.backBtn} onClick={goMore}>← Back</button>
          <h2 style={Z.historyTitle}>Training Log</h2>
          <p style={Z.historySub}>{sessions.length} session{sessions.length!==1?"s":""} logged</p>
          {sessions.length===0 ? (
            <div style={Z.historyEmpty}>No sessions yet — hit "Log a class" on the home screen to start your log.</div>
          ) : (
            <div style={Z.historyList}>
              {sessions.map((s)=>(
                <div key={s.id} style={Z.historyRow}>
                  <div style={Z.historyRowTop}>
                    <span style={Z.historyDate}>{formatDate(new Date(s.date))}</span>
                    {s.type==="strength" ? (
                      <span style={{...Z.historyType,color:"#6A9EE8"}}>💪 {s.strengthType||"Strength"}</span>
                    ) : (
                      <span style={{...Z.historyType,color:s.type==="competition"?"#C9A15A":warrior.accent}}>{s.type==="competition"?"Competition":"Class"} · +{s.points}</span>
                    )}
                  </div>
                  {s.type==="strength"&&s.durationMin&&(
                    <div style={Z.historyCompRow}><span style={Z.historyEventName}>{s.durationMin} min session</span></div>
                  )}
                  {s.type==="competition"&&(
                    <div style={Z.historyCompRow}>
                      <span style={Z.historyEventName}>{s.eventName||"Competition"}</span>
                      <span style={Z.unverifiedPill}>Unverified</span>
                    </div>
                  )}
                  {s.tags&&s.tags.length>0&&<div style={Z.historyTags}>{s.tags.map((t)=>(<span key={t} style={Z.historyTagPill}>{t}</span>))}</div>}
                  {s.note&&<p style={Z.historyNote}>{s.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {warrior&&compModalOpen&&(
        <div style={Z.detailOverlay}>
          <div style={Z.detailSheet}>
            <div style={Z.detailTitle}>What competition?</div>
            <p style={Z.compHint}>Name the event so your log stays honest — this shows as "Unverified" until a coach confirms it.</p>
            <input
              value={compEventName}
              onChange={(e)=>setCompEventName(e.target.value)}
              placeholder="e.g. IBJJF Atlanta Open"
              style={Z.compInput}
              autoFocus
            />
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="act" style={Z.skipBtn} onClick={()=>setCompModalOpen(false)}>Cancel</button>
              <button className="act" style={{...Z.saveBtn,background:compEventName.trim()?warrior.accent:"#3A414D",opacity:compEventName.trim()?1:0.6}} onClick={confirmComp} disabled={!compEventName.trim()}>Log competition</button>
            </div>
          </div>
        </div>
      )}

      {warrior&&strengthModalOpen&&(
        <div style={Z.detailOverlay}>
          <div style={Z.detailSheet}>
            <div style={Z.detailTitle}>Log strength session</div>
            <p style={Z.compHint}>Tracked in your stats and streak — but strength doesn't earn warrior points. Your rank stays pure BJJ.</p>
            <div style={Z.pfLabel}>Type</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
              {STRENGTH_TYPES.map((t)=>(
                <button key={t} className="stp" onClick={()=>setStrengthType(t)}
                  style={{...Z.tagChip,...(strengthType===t?{background:"#6A9EE8",borderColor:"#6A9EE8",color:"#14181F"}:{})}}>
                  {t}
                </button>
              ))}
            </div>
            <div style={Z.pfLabel}>Duration: {strengthDuration} min</div>
            <div style={{display:"flex",gap:6,marginBottom:4}}>
              {[15,30,45,60,90].map((m)=>(
                <button key={m} className="stp" onClick={()=>setStrengthDuration(m)}
                  style={{...Z.durChip,...(strengthDuration===m?{background:"#6A9EE8",borderColor:"#6A9EE8",color:"#14181F"}:{})}}>
                  {m}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button className="act" style={Z.skipBtn} onClick={()=>setStrengthModalOpen(false)}>Cancel</button>
              <button className="act" style={{...Z.saveBtn,background:"#6A9EE8"}} onClick={confirmStrength}>Log it</button>
            </div>
          </div>
        </div>
      )}

      {warrior&&detailPrompt!==null&&(()=>{
        const editing = sessions.find((s)=>s.id===detailPrompt);
        const isClass = editing?.type==="class";
        const bd = draftBreakdown;
        const setBd = (k,v)=>setDraftBreakdown((b)=>({...b,[k]:Math.max(0,Math.min(100,v))}));
        const totalMin = bd.warmup+bd.drilling+bd.rolling;
        return (
        <div style={Z.detailOverlay}>
          <div style={Z.detailSheet}>
            <div style={Z.detailTitle}>Add details? <span style={Z.detailOptional}>(optional)</span></div>

            {isClass&&(
              <div style={{marginBottom:14}}>
                <div style={Z.pfLabel}>Time breakdown · {Math.floor(totalMin/60)}h {totalMin%60}m total</div>
                {[["warmup","Warm-up"],["drilling","Drilling"],["rolling","Live rolling"]].map(([k,label])=>(
                  <div key={k} style={Z.bdRow}>
                    <span style={Z.bdLabel}>{label}</span>
                    <div style={Z.bdStepper}>
                      <button className="stp" style={Z.bdBtn} onClick={()=>setBd(k,bd[k]-5)}>−</button>
                      <input
                        type="number"
                        value={bd[k]}
                        onChange={(e)=>setBd(k, e.target.value===""?0:parseInt(e.target.value,10)||0)}
                        style={Z.bdInput}
                        inputMode="numeric"
                        min={0}
                        max={100}
                      />
                      <span style={Z.bdUnit}>m</span>
                      <button className="stp" style={Z.bdBtn} onClick={()=>setBd(k,bd[k]+5)}>+</button>
                    </div>
                  </div>
                ))}
                <div style={Z.bdHint}>Tap a number to type it exactly · 100 min max per segment.</div>
              </div>
            )}

            <div style={Z.pfLabel}>Techniques</div>
            <div style={Z.tagGrid}>
              {TAG_OPTIONS.map((tag)=>(
                <button key={tag} className="stp" onClick={()=>toggleTag(tag)}
                  style={{...Z.tagChip,...(draftTags.includes(tag)?{background:warrior.accent,borderColor:warrior.accent,color:"#14181F"}:{})}}>
                  {tag}
                </button>
              ))}
            </div>
            {!showNoteBox?(
              <button className="act" style={Z.addNoteLink} onClick={()=>setShowNoteBox(true)}>+ Add a note</button>
            ):(
              <textarea value={draftNote} onChange={(e)=>setDraftNote(e.target.value)}
                placeholder="What happened? e.g. Hit a triangle, got caught in an ankle lock..."
                style={Z.noteBox} rows={3} />
            )}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="act" style={Z.skipBtn} onClick={skipDetails}>Skip</button>
              <button className="act" style={{...Z.saveBtn,background:warrior.accent}} onClick={saveDetails}>Save</button>
            </div>
          </div>
        </div>
        );
      })()}

      </div></div>
    </div>
  );
}

const Z={
  page:{minHeight:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(circle at 50% 0%, #1A2029 0%, #0B0E13 65%)",padding:"24px 12px",fontFamily:"'Inter', sans-serif"},
  phone:{width:390,maxWidth:"100%",height:800,maxHeight:"92vh",background:"#05070A",borderRadius:44,padding:14,boxShadow:"0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",position:"relative"},
  notch:{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",width:90,height:22,background:"#05070A",borderRadius:14,zIndex:2},
  screen:{width:"100%",height:"100%",background:"#14181F",borderRadius:32,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",color:"#EDEFF2"},
  introWrap:{height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"72px 28px 40px"},
  kicker:{fontSize:13,color:"#8B95A3",letterSpacing:0.2,marginBottom:10},
  introTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:52,lineHeight:1.02,letterSpacing:0.5,margin:"0 0 18px",color:"#EDEFF2"},
  introBody:{fontSize:15,lineHeight:1.55,color:"#B7BFC9",maxWidth:280},
  primaryBtn:{width:"100%",padding:"16px 20px",background:"#C9A15A",color:"#14181F",border:"none",borderRadius:14,fontSize:16,fontWeight:700},
  fn:{textAlign:"center",fontSize:11.5,color:"#5D6673",marginTop:8},
  quizWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"36px 24px 32px"},
  stripeRow:{display:"flex",gap:6,marginBottom:18},stripe:{flex:1,height:5,borderRadius:3},
  qCount:{fontSize:12.5,color:"#8B95A3",marginBottom:10},
  quizQ:{fontSize:19,fontWeight:700,lineHeight:1.3,color:"#EDEFF2",margin:"0 0 20px"},
  optCol:{display:"flex",flexDirection:"column",gap:8,overflowY:"auto"},
  optBtn:{textAlign:"left",padding:"12px 14px",background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#EDEFF2",fontSize:14,lineHeight:1.4},
  revealWrap:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 24px 32px",textAlign:"center",overflowY:"auto"},
  revKicker:{fontSize:12.5,color:"#C9A15A",fontWeight:600,marginBottom:12},
  revName:{fontFamily:"'Bebas Neue', sans-serif",fontSize:32,letterSpacing:0.5,margin:"8px 0 2px"},
  revArch:{fontSize:13,color:"#8B95A3",fontWeight:600,margin:"0 0 4px"},
  revTag:{fontSize:12.5,color:"#8B95A3",margin:"0 0 12px",fontStyle:"italic"},
  revDesc:{fontSize:13.5,lineHeight:1.6,color:"#D5DAE1",margin:"0 0 24px",maxWidth:270},
  homeWrap:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 22px 84px",position:"relative"},
  homeHead:{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",marginBottom:8},
  archTag:{fontSize:11.5,fontWeight:600},
  streakTag:{fontSize:11,color:"#E8935A",fontWeight:600},
  ptsTag:{fontSize:11.5,color:"#C9A15A",fontWeight:600},
  tapHint:{fontSize:10.5,color:"#5D6673",margin:"4px 0 6px"},
  tierName:{fontFamily:"'Bebas Neue', sans-serif",fontSize:28,letterSpacing:0.5,margin:"0 0 2px"},
  wLabel:{fontSize:12,color:"#8B95A3",marginBottom:12},
  xpSec:{width:"100%",marginBottom:12},
  xpRow:{display:"flex",justifyContent:"space-between",marginBottom:6},
  xpL:{fontSize:11,color:"#8B95A3"},
  xpTrack:{height:7,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden"},
  xpFill:{height:"100%",borderRadius:4,transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)"},
  homeFoot:{marginTop:"auto",marginBottom:8,width:"100%",display:"flex",flexDirection:"column",gap:8},
  secBtn:{padding:"12px 16px",background:"transparent",border:"1px solid rgba(255,255,255,0.18)",color:"#EDEFF2",borderRadius:14,fontSize:13,fontWeight:600},
  popLayer:{position:"absolute",top:160,left:0,right:0,display:"flex",justifyContent:"center",pointerEvents:"none"},
  popup:{position:"absolute",fontFamily:"'Bebas Neue', sans-serif",fontSize:20,animation:"floatUp 1.3s ease-out forwards"},
  evoOverlay:{height:"100%",background:"rgba(5,7,10,0.88)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"},
  evoCard:{textAlign:"center"},evoKicker:{fontSize:13,color:"#C9A15A",fontWeight:600,marginBottom:6},
  evoTo:{fontFamily:"'Bebas Neue', sans-serif",fontSize:36,letterSpacing:0.5},
  duelWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"36px 18px 22px"},
  backBtn:{background:"none",color:"#8B95A3",fontSize:13,textAlign:"left",padding:0,marginBottom:6},
  recRow:{textAlign:"center",marginBottom:6},recText:{fontFamily:"'Bebas Neue', sans-serif",fontSize:18,color:"#C9A15A",letterSpacing:0.5},
  roundScoreRow:{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:8},
  roundDots:{display:"flex",gap:5},
  roundDot:{width:10,height:10,borderRadius:"50%"},
  roundLabel:{fontFamily:"'Bebas Neue', sans-serif",fontSize:15,letterSpacing:0.5,minWidth:96,textAlign:"center"},
  roundBreak:{textAlign:"center",fontFamily:"'Bebas Neue', sans-serif",fontSize:22,color:"#EDEFF2",letterSpacing:0.5,padding:"18px 0"},
  finalScore:{fontSize:12,color:"#8B95A3",marginTop:6,fontWeight:600},
  hpTrack:{height:6,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"},hpFill:{height:"100%",borderRadius:3},
  arena:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,padding:"0 4px"},
  fCol:{display:"flex",flexDirection:"column",alignItems:"center",gap:4},
  fLbl:{fontSize:9.5,fontWeight:600,textAlign:"center",maxWidth:85},
  vs:{fontFamily:"'Bebas Neue', sans-serif",fontSize:18,color:"#5D6673"},
  stepper:{display:"flex",alignItems:"center",gap:4},
  stepBtn:{width:20,height:20,borderRadius:6,background:"#1D232D",color:"#EDEFF2",fontSize:13,lineHeight:1},
  stepText:{fontSize:9.5,color:"#8B95A3",minWidth:38,textAlign:"center"},
  oppTabs:{display:"flex",justifyContent:"center",gap:5,marginBottom:8},
  tab:{background:"transparent",border:"1px solid",borderRadius:20,padding:"4px 8px",fontSize:9.5,fontWeight:600},
  oddsBox:{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"9px 14px",marginBottom:8},
  oddsL:{fontSize:11.5,color:"#8B95A3"},oddsV:{fontFamily:"'Bebas Neue', sans-serif",fontSize:20,color:"#EDEFF2"},
  resBox:{background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 14px",marginBottom:6},
  resBanner:{fontFamily:"'Bebas Neue', sans-serif",fontSize:22,letterSpacing:0.5,marginBottom:3},
  narr:{fontSize:12.5,lineHeight:1.5,color:"#D5DAE1",margin:0},
  duelBtn:{width:"100%",padding:"14px 20px",background:"#C9A15A",color:"#14181F",borderRadius:14,fontSize:15,fontWeight:700},
  stepperRow:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8},
  formatLabel:{fontSize:11,color:"#8B95A3",textAlign:"center",marginBottom:6,fontWeight:600},
  formatSeg:{display:"flex",gap:0,background:"#12161C",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,overflow:"hidden",marginBottom:10},
  formatSegBtn:{flex:1,padding:"9px 0",background:"transparent",border:"none",color:"#8B95A3",fontSize:12,fontWeight:700,transition:"background 0.15s"},
  duelLog:{fontSize:12.5,fontWeight:600,textAlign:"center",marginBottom:6,minHeight:16},
  timingTrack:{position:"relative",height:26,background:"#12161C",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,cursor:"pointer",overflow:"visible"},
  timingHint:{fontSize:10,color:"#8B95A3",textAlign:"center",marginTop:5,letterSpacing:1,fontWeight:600},
  tapAnywhereHint:{fontSize:9.5,color:"#5D6673",textAlign:"center",marginTop:2},
  rankNote:{fontSize:10.5,lineHeight:1.5,color:"#5D6673",textAlign:"center",marginBottom:6},
  shopWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"36px 22px 24px",overflowY:"auto"},
  shopTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:30,margin:"8px 0 4px"},
  shopSub:{fontSize:12,color:"#8B95A3",marginBottom:16},
  shopGrid:{display:"flex",flexDirection:"column",gap:10},
  shopCard:{display:"flex",alignItems:"center",gap:12,background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 14px"},
  shopDot:{width:32,height:32,borderRadius:10,flexShrink:0},
  shopName:{fontSize:13,fontWeight:600,color:"#EDEFF2"},shopDesc:{fontSize:11,color:"#8B95A3",marginTop:2},
  shopOwned:{fontSize:11,color:"#3E9B7F",fontWeight:600},
  shopBuyBtn:{padding:"6px 12px",borderRadius:8,color:"#14181F",fontSize:12,fontWeight:700},
  historyWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"36px 20px 20px"},
  historyTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:30,margin:"8px 0 2px"},
  historySub:{fontSize:12,color:"#8B95A3",marginBottom:14},
  historyEmpty:{fontSize:13,color:"#5D6673",textAlign:"center",marginTop:40,lineHeight:1.6},
  historyList:{display:"flex",flexDirection:"column",gap:9,overflowY:"auto",flex:1},
  historyRow:{background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"11px 13px"},
  historyRowTop:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  historyDate:{fontSize:12.5,color:"#8B95A3",fontWeight:600},
  historyType:{fontSize:12,fontWeight:700},
  historyTags:{display:"flex",flexWrap:"wrap",gap:5,marginTop:8},
  historyTagPill:{fontSize:10.5,fontWeight:600,color:"#D5DAE1",background:"rgba(255,255,255,0.08)",padding:"3px 9px",borderRadius:12},
  historyNote:{fontSize:12.5,lineHeight:1.5,color:"#B7BFC9",marginTop:8,marginBottom:0,fontStyle:"italic"},
  detailOverlay:{position:"absolute",inset:0,background:"rgba(5,7,10,0.72)",display:"flex",alignItems:"flex-end",zIndex:20},
  detailSheet:{width:"100%",background:"#181D26",borderTopLeftRadius:24,borderTopRightRadius:24,padding:"22px 20px 26px",boxShadow:"0 -8px 30px rgba(0,0,0,0.5)"},
  detailTitle:{fontSize:15,fontWeight:700,color:"#EDEFF2",marginBottom:12},
  detailOptional:{fontSize:12,fontWeight:500,color:"#5D6673"},
  tagGrid:{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10},
  tagChip:{padding:"7px 12px",borderRadius:18,fontSize:12.5,fontWeight:600,color:"#D5DAE1",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)"},
  durChip:{flex:1,padding:"9px 0",borderRadius:10,fontSize:13,fontWeight:700,color:"#D5DAE1",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)"},
  bdRow:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8},
  bdLabel:{fontSize:13,color:"#D5DAE1",fontWeight:600},
  bdStepper:{display:"flex",alignItems:"center",gap:8},
  bdBtn:{width:26,height:26,borderRadius:7,background:"#242A34",border:"1px solid rgba(255,255,255,0.12)",color:"#EDEFF2",fontSize:15,lineHeight:1},
  bdInput:{width:38,background:"#242A34",border:"1px solid rgba(255,255,255,0.12)",borderRadius:7,color:"#EDEFF2",fontSize:13,fontWeight:700,textAlign:"center",padding:"4px 2px",outline:"none",MozAppearance:"textfield"},
  bdUnit:{fontSize:12,color:"#8B95A3",marginLeft:-4},
  bdHint:{fontSize:10.5,color:"#5D6673",marginTop:4,fontStyle:"italic"},
  matTotalRow:{fontFamily:"'Bebas Neue', sans-serif",fontSize:26,color:"#EDEFF2",marginBottom:12},
  matTotalSub:{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#8B95A3",fontWeight:600,marginLeft:6},
  matNote:{fontSize:11,color:"#5D6673",marginTop:8,fontStyle:"italic"},
  addNoteLink:{background:"none",color:"#8B95A3",fontSize:12.5,fontWeight:600,padding:"4px 0",textAlign:"left"},
  noteBox:{width:"100%",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#EDEFF2",fontSize:13,fontFamily:"'Inter',sans-serif",padding:"10px 12px",resize:"none",outline:"none"},
  skipBtn:{flex:1,padding:"13px 20px",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"#8B95A3",borderRadius:14,fontSize:14,fontWeight:600},
  saveBtn:{flex:1,padding:"13px 20px",color:"#14181F",borderRadius:14,fontSize:14,fontWeight:700},
  compHint:{fontSize:12,lineHeight:1.5,color:"#8B95A3",marginBottom:12},
  compInput:{width:"100%",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#EDEFF2",fontSize:14,fontFamily:"'Inter',sans-serif",padding:"12px 14px",outline:"none",boxSizing:"border-box"},
  historyCompRow:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6},
  historyEventName:{fontSize:12,color:"#B7BFC9",fontStyle:"italic"},
  unverifiedPill:{fontSize:9.5,fontWeight:700,color:"#8B95A3",background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:10,letterSpacing:0.3},
  rosterWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"44px 20px 74px"},
  rosterTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:30,margin:"8px 0 2px"},
  rosterSub:{fontSize:12,lineHeight:1.5,color:"#8B95A3",marginBottom:16},
  rosterList:{display:"flex",flexDirection:"column",gap:9,overflowY:"auto",flex:1},
  rosterCard:{display:"flex",alignItems:"center",gap:12,background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"10px 12px"},
  rosterName:{fontSize:13.5,fontWeight:700},
  rosterMeta:{fontSize:11.5,color:"#8B95A3",marginTop:2},
  rosterLocked:{fontSize:11,color:"#5D6673",marginTop:2},
  rosterSwitchBtn:{padding:"7px 13px",borderRadius:10,background:"transparent",border:"1px solid",fontSize:11.5,fontWeight:700,flexShrink:0},
  rosterActiveTag:{fontSize:11,fontWeight:700,flexShrink:0},
  premiumTag:{fontSize:8.5,fontWeight:800,color:"#14181F",background:"#D9A93E",padding:"1px 6px",borderRadius:8,marginLeft:8,letterSpacing:0.5,verticalAlign:"middle"},
  rosterBuyBtn:{padding:"8px 14px",borderRadius:10,background:"#D9A93E",border:"none",color:"#14181F",fontSize:12.5,fontWeight:800,flexShrink:0},
  schedLine:{fontSize:12.5,fontWeight:600,color:"#B7BFC9",background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"8px 12px",textAlign:"center",marginBottom:10,cursor:"pointer"},
  schedPrompt:{width:"100%",padding:"12px 16px",color:"#14181F",border:"none",borderRadius:12,fontSize:14,fontWeight:700,marginBottom:10},
  schedWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"36px 20px 20px",overflowY:"auto"},
  schedTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:30,margin:"8px 0 2px"},
  schedSub:{fontSize:12,lineHeight:1.5,color:"#8B95A3",marginBottom:16},
  schedList:{display:"flex",flexDirection:"column",gap:8,marginBottom:18},
  schedEmpty:{fontSize:13,color:"#5D6673",textAlign:"center",padding:"16px 0"},
  schedRow:{display:"flex",alignItems:"center",gap:12,background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"11px 13px"},
  schedDay:{fontSize:13.5,fontWeight:700,color:"#EDEFF2"},
  schedTime:{fontSize:12,color:"#8B95A3",marginTop:2},
  schedRemove:{background:"transparent",border:"1px solid rgba(179,58,58,0.4)",color:"#B33A3A",borderRadius:9,padding:"6px 11px",fontSize:11.5,fontWeight:600,flexShrink:0},
  schedExportBtn:{width:"100%",padding:"12px 16px",background:"transparent",border:"1px solid rgba(90,180,140,0.5)",color:"#5AB48C",borderRadius:12,fontSize:14,fontWeight:700,marginBottom:18},
  navBar:{position:"absolute",bottom:0,left:0,right:0,height:62,background:"rgba(10,13,18,0.92)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",zIndex:15},
  navItem:{flex:1,background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,paddingTop:4},
  navIcon:{fontSize:19,lineHeight:1},
  navLabel:{fontSize:10,fontWeight:600},
  moreWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"44px 20px 74px"},
  moreTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:32,margin:"0 0 16px"},
  moreList:{display:"flex",flexDirection:"column",gap:10},
  moreItem:{display:"flex",alignItems:"center",gap:14,background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 16px",cursor:"pointer"},
  moreItemIcon:{fontSize:22,width:24,textAlign:"center"},
  moreItemName:{fontSize:14.5,fontWeight:700,color:"#EDEFF2"},
  moreItemSub:{fontSize:11.5,color:"#8B95A3",marginTop:2},
  moreChevron:{fontSize:22,color:"#5D6673",fontWeight:400},
  statsWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"44px 20px 74px",overflowY:"auto"},
  statsTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:32,margin:"0 0 2px"},
  statsSub:{fontSize:12,color:"#8B95A3",marginBottom:16},
  statsGrid:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:18},
  statCard:{background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 8px",textAlign:"center"},
  statNum:{fontFamily:"'Bebas Neue', sans-serif",fontSize:26,lineHeight:1},
  statLbl:{fontSize:10,color:"#8B95A3",marginTop:4},
  statsSection:{marginBottom:18},
  statsSectionTitle:{fontSize:13,fontWeight:700,color:"#EDEFF2",marginBottom:10},
  duelRecordRow:{display:"flex",alignItems:"center",gap:8,background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",fontFamily:"'Bebas Neue', sans-serif",fontSize:22},
  winPct:{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"#8B95A3",marginLeft:4},
  statsEmpty:{fontSize:12.5,lineHeight:1.5,color:"#5D6673",background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px"},
  tagBars:{display:"flex",flexDirection:"column",gap:9},
  tagBarRow:{display:"flex",alignItems:"center",gap:10},
  tagBarLabel:{fontSize:12,fontWeight:600,color:"#D5DAE1",width:80,flexShrink:0},
  tagBarTrack:{flex:1,height:10,background:"rgba(255,255,255,0.08)",borderRadius:5,overflow:"hidden"},
  tagBarFill:{height:"100%",borderRadius:5},
  tagBarCount:{fontFamily:"'Bebas Neue', sans-serif",fontSize:16,color:"#EDEFF2",width:22,textAlign:"right",flexShrink:0},
  profileWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"40px 24px 28px",overflowY:"auto"},
  profileKicker:{fontSize:12.5,color:"#C9A15A",fontWeight:600,marginBottom:6},
  profileTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:30,margin:"0 0 6px",letterSpacing:0.5},
  profileSub:{fontSize:13,lineHeight:1.5,color:"#8B95A3",marginBottom:20},
  pfField:{marginBottom:18},
  pfLabel:{fontSize:12,fontWeight:600,color:"#8B95A3",marginBottom:8},
  pfInput:{width:"100%",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#EDEFF2",fontSize:15,fontFamily:"'Inter',sans-serif",padding:"12px 14px",outline:"none",boxSizing:"border-box"},
  beltRow:{display:"flex",gap:6,flexWrap:"wrap"},
  beltChip:{flex:"1 0 auto",padding:"9px 10px",borderRadius:10,fontSize:12,fontWeight:700,border:"none",minWidth:52},
  stripeRow2:{display:"flex",gap:8},
  stripeChip:{flex:1,padding:"11px 0",borderRadius:10,fontSize:15,fontWeight:700,color:"#D5DAE1",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)"},
  beltPreview:{margin:"6px 0 20px",textAlign:"center"},
  beltBar:{height:34,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:20,position:"relative",boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.2)"},
  beltBlackBar:{width:64,height:"100%",background:"#111",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",gap:4},
  beltStripe:{width:6,height:"70%",background:"#fff",borderRadius:1},
  beltPreviewLabel:{fontSize:12.5,color:"#B7BFC9",marginTop:8,fontWeight:600},
  profileSummary:{display:"flex",alignItems:"center",gap:14,background:"#1D232D",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 14px",marginBottom:14},
  profileSumName:{fontSize:16,fontWeight:700},
  profileSumSub:{fontSize:12,color:"#8B95A3",marginTop:2},
  schedAddBox:{background:"#181D26",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 14px 16px"},
  schedAddLabel:{fontSize:13,fontWeight:700,color:"#EDEFF2",marginBottom:10},
  schedDayPicker:{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"},
  schedDayChip:{flex:"1 0 auto",minWidth:38,padding:"7px 0",borderRadius:9,fontSize:11.5,fontWeight:700,color:"#D5DAE1",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)"},
  schedTimeRow:{display:"flex",gap:10,marginBottom:12},
  schedTimeLabel:{fontSize:11,color:"#8B95A3",marginBottom:4},
  schedTimeInput:{width:"100%",background:"#242A34",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#EDEFF2",fontSize:14,fontFamily:"'Inter',sans-serif",padding:"9px 11px",outline:"none",boxSizing:"border-box"},
  schedAddBtn:{width:"100%",padding:"12px 16px",color:"#14181F",border:"none",borderRadius:12,fontSize:14,fontWeight:700},
  boardWrap:{height:"100%",display:"flex",flexDirection:"column",padding:"36px 20px 20px"},
  boardTitle:{fontFamily:"'Bebas Neue', sans-serif",fontSize:30,margin:"8px 0 2px"},
  boardSub:{fontSize:12,color:"#8B95A3",marginBottom:14},
  boardList:{display:"flex",flexDirection:"column",gap:7,overflowY:"auto",flex:1},
  boardRow:{display:"flex",alignItems:"center",gap:10,background:"#1D232D",borderRadius:12,padding:"8px 12px"},
  boardRank:{fontFamily:"'Bebas Neue', sans-serif",fontSize:18,minWidth:20,textAlign:"center"},
  boardName:{fontSize:13,fontWeight:600,color:"#EDEFF2",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  boardMeta:{fontSize:10.5,color:"#8B95A3",marginTop:1},
  boardPts:{fontFamily:"'Bebas Neue', sans-serif",fontSize:20},
  verBadge:{fontSize:9,color:"#5AB48C",fontWeight:600,marginLeft:4},
  boardFoot:{fontSize:10.5,lineHeight:1.5,color:"#5D6673",marginTop:12},
};
