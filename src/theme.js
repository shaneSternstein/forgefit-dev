
export const theme = {
    black: "#040709",
    carbon: "#080D13",
    steel: "#0E141C",
    border: "#1C2530",
    muted: "#545C6B",
    sub: "#8B92A5",
    text: "#E6E6EB",
    white: "#FFFFFF",
    gold: "#D4993D",
    platinum: "#BFC3FF",
    ice: "#C9EAFF",
    push: "#C4536B",
    pull: "#BFC3FF",
    legs: "#6B9080",
    pelo: "#BFC3FF",
    phase: "#D4993D"
  };

export const CATEGORY_COLORS = {
    push: theme.push,
    pull: theme.pull,
    legs: theme.legs
  };

// Shared metallic gradient + glow tokens so every screen renders the same
// "brushed metal" language instead of flat fills. Gold is calibrated off
// real pixel samples from the reference render (mid-tone bar fill
// ~#D9A546/#BC8735) — warmer and less green than an earlier #D4AF37 pass.
export const metal = {
  silverText: `linear-gradient(180deg, #FFFFFF 0%, #F3EEE2 30%, #B7AE9C 50%, #EAE2D2 72%, #FFFFFF 100%)`,
  goldText: `linear-gradient(180deg, #F7EBC8 0%, #D4993D 42%, #8F6519 58%, #E8B34F 80%, #F7EBC8 100%)`,
  // Small eyebrow/label gradient — straightforward yellow-to-orange,
  // top to bottom, per direct request rather than the fuller metal ramp.
  eyebrowGold: `linear-gradient(180deg, #FFDD82 0%, #E8B34F 45%, #C4832A 100%)`,
  // Exact two-stop gradients per direct spec, top to bottom.
  greetingSilver: `linear-gradient(180deg, #EEF2F3 0%, #55565A 100%)`,
  eyebrowTan: `linear-gradient(180deg, #CCC59C 0%, #BD995F 100%)`,
  // Button fill: dark on the outer edges, brightest in the center,
  // matching the reference's "lit from the middle" metal bar look.
  goldSurfaceH: `linear-gradient(90deg, #6E4F17 0%, #C4832A 16%, #EFC978 38%, #F7EBC8 50%, #EFC978 62%, #C4832A 84%, #6E4F17 100%)`,
  goldSurface: `linear-gradient(135deg, #8F6519 0%, #EFC978 22%, #D4993D 45%, #F7EBC8 60%, #A97A24 80%, #E8B34F 100%)`,
  // Bar fill: brighter overall, less hotspot contrast than the button.
  goldBar: `linear-gradient(90deg, #C4832A, #EFC978 25%, #F2DBA0 50%, #EFC978 75%, #C4832A)`,
  glowGold: `0 0 16px rgba(212,153,61,0.28)`,
  glowGoldSoft: `0 0 10px rgba(212,153,61,0.18)`,
  glowGoldTight: `0 2px 6px rgba(212,153,61,0.28), 0 0 1px rgba(212,153,61,0.55)`,
  glowPlatinum: `0 0 10px rgba(191,195,255,0.35)`,
  glowIce: `0 0 8px rgba(201,234,255,0.3)`,
  insetTop: `inset 0 1px 0 rgba(255,255,255,0.05)`,
  ambientGlow: `radial-gradient(ellipse 480px 220px at 15% 0%, rgba(212,153,61,0.06), transparent 70%)`,
  barHotspot: `radial-gradient(circle, rgba(255,244,214,0.65), rgba(255,244,214,0) 70%)`,
  // Top-lit border for cards (WK5, Today): a radial glow centered at the
  // top edge, not a uniform linear fade — matches the reference's bright
  // "sunrise" catch at top-center of each card outline.
  borderRadialGold: `radial-gradient(ellipse 55% 140% at 50% -20%, rgba(247,235,200,0.75), rgba(212,153,61,0.16) 55%, rgba(212,153,61,0.05) 100%)`,
  // Diagonal metallic border for square tiles (settings icon): bright
  // top-left, dark bottom-right.
  borderDiagonalGold: `linear-gradient(135deg, rgba(255,244,214,0.9), rgba(212,153,61,0.45) 45%, rgba(122,86,26,0.55) 100%)`,
  // Subtle neutral-metal border for plain tiles (stat cards).
  borderMetalNeutral: `linear-gradient(180deg, rgba(200,206,220,0.35), rgba(120,128,145,0.12) 60%, rgba(90,98,115,0.08) 100%)`,
  // Progress-bar outline: dark at the top, lighter at the bottom — the
  // inverse of the card border, per direct request.
  borderBarVertical: `linear-gradient(180deg, rgba(70,55,20,0.5), rgba(247,235,200,0.35) 100%)`,
  carbonGradient: `linear-gradient(180deg, #0A0F16 0%, #060A0F 100%)`,
  steelGradient: `linear-gradient(180deg, #10161F 0%, #0A0F16 100%)`,
  grain: `repeating-linear-gradient(115deg, rgba(255,255,255,0.09) 0 1px, rgba(0,0,0,0.05) 1px 2px, transparent 2px 3px)`,
  bevelSilver: `0 -1px 0 rgba(255,255,255,0.55), 0 1px 1px rgba(0,0,0,0.75), 0 2px 5px rgba(0,0,0,0.45)`,
  bevelGold: `0 -1px 0 rgba(247,235,200,0.6), 0 1px 1px rgba(60,40,0,0.8), 0 2px 5px rgba(0,0,0,0.5)`
};

export const gradientText = (bg) => ({
  backgroundImage: bg,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent"
});

// Produces the double-background "gradient border" so a tile can have a
// metallic rim on top of its own (possibly gradient) fill without a
// separate wrapper element. `bgLayer` and `borderLayer` must both be
// valid background-image values (gradients).
export const gradientBorder = (bgLayer, borderLayer) => ({
  border: "1px solid transparent",
  backgroundImage: `${bgLayer}, ${borderLayer}`,
  backgroundOrigin: "border-box",
  backgroundClip: "padding-box, border-box"
});

// Backwards-compatible alias used by earlier screens.
export const topLitGoldBorder = (bgLayer) => gradientBorder(bgLayer, metal.borderRadialGold);

export const glintPath = "M50 6 C55 34 66 45 94 50 C66 55 55 66 50 94 C45 66 34 55 6 50 C34 45 45 34 50 6 Z";
