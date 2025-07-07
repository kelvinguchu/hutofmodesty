import Link from "next/link";
import { FaInstagram, FaEnvelope, FaTiktok } from "react-icons/fa";
import { MapPin, Phone, Mail } from "lucide-react";
import LogoDark from "@/components/admin/LogoDark";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='hidden md:block bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-8'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
          {/* Logo and About */}
          <div className='space-y-6'>
            <Link href='/' className='inline-flex items-center group'>
              <LogoDark />
            </Link>
            <p className='text-gray-300 leading-relaxed text-sm'>
              Crafting elegance with a touch of modesty.
            </p>
            <div className='flex space-x-4 pt-4'>
              <a
                href='https://www.instagram.com/hut_of_modesty?igsh=MWNvc21zMHg2MXo4aw%3D%3D&utm_source=qr'
                className='p-3 bg-gray-800 text-gray-300 hover:text-white hover:bg-primary transition-all duration-200 rounded-lg hover:scale-110 transform'
                aria-label='Instagram'>
                <FaInstagram className='w-5 h-5' />
              </a>
              <a
                href='https://www.tiktok.com/@hut_of_modesty?_t=ZM-8xdIUgVuXw6&_r=1'
                className='p-3 bg-gray-800 text-gray-300 hover:text-white hover:bg-primary transition-all duration-200 rounded-lg hover:scale-110 transform'
                aria-label='Tiktok'>
                <FaTiktok className='w-5 h-5' />
              </a>
              <a
                href='mailto:info@hutofmodesty.com'
                className='p-3 bg-gray-800 text-gray-300 hover:text-white hover:bg-primary transition-all duration-200 rounded-lg hover:scale-110 transform'
                aria-label='Email'>
                <FaEnvelope className='w-5 h-5' />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className='text-lg font-bold mb-6 text-white flex items-center'>
              <span className='w-1 h-6 bg-primary rounded-full mr-3'></span>
              Collections
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  href='/collections/clothing'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/clothing/abayas'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Abayas
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/footwear'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Footwear
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/accessories'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/fragrances'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Fragrances
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-lg font-bold mb-6 text-white flex items-center'>
              <span className='w-1 h-6 bg-primary rounded-full mr-3'></span>
              Contact Us
            </h3>
            <address className='text-sm text-gray-300 not-italic space-y-4'>
              <div className='flex items-start gap-3'>
                <MapPin className='w-4 h-4 text-primary/80 mt-1 flex-shrink-0' />
                <div>
                  <p>Nairobi, Kenya</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Phone className='w-4 h-4 text-primary/80 flex-shrink-0' />
                <a
                  href='tel:+254748355387'
                  className='hover:text-white transition-colors duration-200 cursor-pointer'>
                  +254748355387
                </a>
              </div>

              <div className='flex items-center gap-3'>
                <Mail className='w-4 h-4 text-primary/80 flex-shrink-0' />
                <a
                  href='mailto:info@hutofmodesty.com'
                  className='hover:text-white transition-colors duration-200 cursor-pointer'>
                  info@hutofmodesty.com
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='border-t border-gray-700 mt-12 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-sm text-gray-400'>
              © {currentYear} Hut of Modesty. All rights reserved.
            </p>
            <div className='flex items-center gap-6 text-sm text-gray-400'>
              <Link
                href='/privacy-policy'
                className='hover:text-white transition-colors duration-200'>
                Privacy
              </Link>
              <span>•</span>
              <Link
                href='/terms-conditions'
                className='hover:text-white transition-colors duration-200'>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
