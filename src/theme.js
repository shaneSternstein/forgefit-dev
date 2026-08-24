
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
// "brushed metal" language instead of flat fills.
//
// Gold is calibrated off real pixel samples from the reference (mid-tone
// bar fill ~#D9A546/#BC8735, avoiding the whited-out highlight pixels) —
// warmer and less green than the original #D4AF37.
export const metal = {
  // Warmed toward the reference's measured champagne-white peak
  // (255,255,196) instead of a cool blue-silver.
  silverText: `linear-gradient(180deg, #FFFFFF 0%, #F3EEE2 30%, #B7AE9C 50%, #EAE2D2 72%, #FFFFFF 100%)`,
  goldText: `linear-gradient(180deg, #F7EBC8 0%, #D4993D 42%, #8F6519 58%, #E8B34F 80%, #F7EBC8 100%)`,
  goldSurface: `linear-gradient(135deg, #8F6519 0%, #EFC978 22%, #D4993D 45%, #F7EBC8 60%, #A97A24 80%, #E8B34F 100%)`,
  goldBar: `linear-gradient(90deg, #8F6519, #EFC978 30%, #F7EBC8 50%, #D4993D 75%, #8F6519)`,
  glowGold: `0 0 16px rgba(212,153,61,0.28)`,
  glowGoldSoft: `0 0 10px rgba(212,153,61,0.18)`,
  glowGoldTight: `0 2px 6px rgba(212,153,61,0.28), 0 0 1px rgba(212,153,61,0.55)`,
  glowPlatinum: `0 0 10px rgba(191,195,255,0.35)`,
  insetTop: `inset 0 1px 0 rgba(255,255,255,0.05)`,
  ambientGlow: `radial-gradient(ellipse 480px 220px at 15% 0%, rgba(212,153,61,0.06), transparent 70%)`,
  barHotspot: `radial-gradient(circle, rgba(255,244,214,0.95), rgba(255,244,214,0) 70%)`,
  borderTopLitGold: `linear-gradient(180deg, rgba(247,235,200,0.5), rgba(212,153,61,0.14) 45%, rgba(212,153,61,0.05) 100%)`,
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

export const topLitGoldBorder = (bgLayer) => ({
  border: "1px solid transparent",
  backgroundImage: `${bgLayer}, ${metal.borderTopLitGold}`,
  backgroundOrigin: "border-box",
  backgroundClip: "padding-box, border-box"
});

export const glintPath = "M50 6 C55 34 66 45 94 50 C66 55 55 66 50 94 C45 66 34 55 6 50 C34 45 45 34 50 6 Z";
