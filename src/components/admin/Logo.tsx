import Image from "next/image";

export default function Logo() {
  return (
    <div className='logo'>
      <Image src='/icons/logo.png' alt='Hut of Modesty' width={80} height={70} />
    </div>
  );
}
