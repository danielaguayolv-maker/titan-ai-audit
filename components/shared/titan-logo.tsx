import Image from "next/image";

type TitanLogoProps = {
  label?: string;
};

export function TitanLogo({ label = "Titan Media Group" }: TitanLogoProps) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative h-11 w-16 overflow-hidden rounded-md border border-titan-gold/20 bg-black/30">
        <Image
          alt="Titan Media Group logo"
          className="object-contain p-1"
          fill
          priority
          sizes="64px"
          src="/titan-logo.png"
        />
      </span>
      <span className="text-sm font-black uppercase text-titan-ivory">{label}</span>
    </span>
  );
}
