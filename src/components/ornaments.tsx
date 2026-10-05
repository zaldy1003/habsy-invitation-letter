type AssetName = "rosetteSmall" | "rosetteDivider" | "clock" | "pin" | "calendar" | "rosette" | "chevron" | "watermark" | "book" | "location" | "mapPin" | "directions" | "prayerRosette" | "envelope" | "radio" | "send" | "wishes" | "finalRosette" | "audio";

const assets: Record<AssetName, string> = {
  rosetteSmall: "a5f46.svg", rosetteDivider: "42407.svg", clock: "52a08.svg",
  pin: "1fa87.svg", calendar: "0cc05.svg", rosette: "3aa99.svg",
  chevron: "8962b.svg", watermark: "b6533.svg", book: "30221.svg",
  location: "b9469.svg", mapPin: "d276e.svg", directions: "58f50.svg",
  prayerRosette: "c026f.svg", envelope: "c7277.svg", radio: "950b4.svg",
  send: "5f85e.svg", wishes: "12e78.svg", finalRosette: "cff5c.svg", audio: "b0046.svg",
};

export function Ornament({ name, className = "" }: { name: AssetName; className?: string }) {
  // SVGs keep their original intrinsic dimensions from Figma.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`ornament ${className}`} src={`/images/${assets[name]}`} alt="" aria-hidden="true" />;
}

export function Divider({ final = false }: { final?: boolean }) {
  return <div className="divider" aria-hidden="true"><span /><Ornament name={final ? "finalRosette" : "rosetteDivider"} /><span /></div>;
}

export function Corners() {
  return <div className="corners" aria-hidden="true"><i /><i /><i /><i /></div>;
}
