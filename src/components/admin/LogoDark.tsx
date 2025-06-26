import Image from "next/image";

export default function LogoDark() {
  return (
    <div style={{ display: "inline-block" }}>
      <Image
        src='/icons/logo.png'
        alt='Hut of Modesty'
        width={80}
        height={70}
        style={{
          filter:
            "brightness(0) saturate(100%) invert(1) brightness(0.9) contrast(1.1)",
          transition: "filter 0.3s ease",
        }}
      />
    </div>
  );
}
