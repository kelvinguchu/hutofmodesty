import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({
  width = 80,
  height = 70,
  className,
}: LogoProps) {
  return (
    <div className={`logo ${className || ""}`}>
      <Image
        src='/icons/logo.png'
        alt='Hut of Modesty'
        width={width}
        height={height}
        priority
      />
    </div>
  );
}
