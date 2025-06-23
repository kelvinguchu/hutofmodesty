import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope } from "react-icons/fa";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='hidden md:block bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-8'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
          {/* Logo and About */}
          <div className='space-y-6'>
            <Link href='/' className='inline-flex items-center group'>
              <span className='text-2xl font-black text-white group-hover:text-purple-400 transition-colors duration-200'>
                Hut of Modesty
              </span>
              <div className='ml-3 h-5 w-5 flex items-center justify-center'>
                <div className='h-2.5 w-2.5 bg-purple-500 rounded-full animate-pulse shadow-sm'></div>
              </div>
            </Link>
            <p className='text-gray-300 leading-relaxed text-sm'>
              Premium clothing store featuring Qamis and Abaya collections.
              Where contemporary design meets traditional values.
            </p>
            <div className='flex space-x-4 pt-4'>
              <a
                href='#'
                className='p-3 bg-gray-800 text-gray-300 hover:text-white hover:bg-purple-600 transition-all duration-200 rounded-lg hover:scale-110 transform'
                aria-label='Facebook'>
                <FaFacebook className='w-5 h-5' />
              </a>
              <a
                href='#'
                className='p-3 bg-gray-800 text-gray-300 hover:text-white hover:bg-purple-600 transition-all duration-200 rounded-lg hover:scale-110 transform'
                aria-label='Instagram'>
                <FaInstagram className='w-5 h-5' />
              </a>
              <a
                href='#'
                className='p-3 bg-gray-800 text-gray-300 hover:text-white hover:bg-purple-600 transition-all duration-200 rounded-lg hover:scale-110 transform'
                aria-label='Twitter'>
                <FaTwitter className='w-5 h-5' />
              </a>
              <a
                href='mailto:info@hutofmodesty.com'
                className='p-3 bg-gray-800 text-gray-300 hover:text-white hover:bg-emerald-600 transition-all duration-200 rounded-lg hover:scale-110 transform'
                aria-label='Email'>
                <FaEnvelope className='w-5 h-5' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-lg font-bold mb-6 text-white flex items-center'>
              <span className='w-1 h-6 bg-purple-500 rounded-full mr-3'></span>
              Quick Links
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  href='/about'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href='/faq'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy-policy'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href='/terms-conditions'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h3 className='text-lg font-bold mb-6 text-white flex items-center'>
              <span className='w-1 h-6 bg-emerald-500 rounded-full mr-3'></span>
              Collections
            </h3>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link
                  href='/collections/abaya'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-emerald-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Abayas
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/qamis'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-emerald-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Qamis
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/abaya/hijabs'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-emerald-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Hijabs
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/accessories'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-emerald-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/new-arrivals'
                  className='text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center group'>
                  <span className='w-2 h-2 bg-emerald-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-lg font-bold mb-6 text-white flex items-center'>
              <span className='w-1 h-6 bg-purple-500 rounded-full mr-3'></span>
              Contact Us
            </h3>
            <address className='text-sm text-gray-300 not-italic space-y-4'>
              <div className='flex items-start gap-3'>
                <MapPin className='w-4 h-4 text-purple-400 mt-1 flex-shrink-0' />
                <div>
                  <p>Nairobi, Kenya</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Phone className='w-4 h-4 text-emerald-400 flex-shrink-0' />
                <a
                  href='tel:+254700123456'
                  className='hover:text-white transition-colors duration-200 cursor-pointer'>
                  +254 700 123 456
                </a>
              </div>

              <div className='flex items-center gap-3'>
                <Mail className='w-4 h-4 text-purple-400 flex-shrink-0' />
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
              <span>•</span>
              <Link
                href='/sitemap'
                className='hover:text-white transition-colors duration-200'>
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
