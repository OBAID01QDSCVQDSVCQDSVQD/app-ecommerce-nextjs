'use client'

import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaGoogle, FaCog } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2d3442] text-white pt-12 pb-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image src="/icones/logo.svg" alt="bazaar logo" width={60} height={60} />
            <span className="text-2xl font-bold">bazaar</span>
          </div>
          <p className="text-gray-300 mb-6 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.
          </p>
          <div className="flex gap-3">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image src="/google-play-badge.png" alt="Google Play" width={140} height={40} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image src="/app-store-badge.png" alt="App Store" width={140} height={40} />
            </a>
          </div>
        </div>
        {/* About Us */}
        <div>
          <h3 className="font-bold text-lg mb-4">About Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="#">Careers</Link></li>
            <li><Link href="#">Our Stores</Link></li>
            <li><Link href="#">Our Cares</Link></li>
            <li><Link href="#">Terms & Conditions</Link></li>
            <li><Link href="#">Privacy Policy</Link></li>
          </ul>
        </div>
        {/* Customer Care */}
        <div>
          <h3 className="font-bold text-lg mb-4">Customer Care</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="#">Help Center</Link></li>
            <li><Link href="#">Track Your Order</Link></li>
            <li><Link href="#">Corporate & Bulk Purchasing</Link></li>
            <li><Link href="#">Returns & Refunds</Link></li>
          </ul>
        </div>
        {/* Contact Us */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contact Us</h3>
          <p className="text-gray-300 text-sm mb-2">70 Washington Square South, New York, NY 10012, United States</p>
          <p className="text-gray-300 text-sm mb-2">Email: uilib.help@gmail.com</p>
          <p className="text-gray-300 text-sm mb-4">Phone: +1 1123 456 780</p>
          <div className="flex gap-3 mb-4">
            <a href="#" className="bg-[#232936] p-2 rounded-full hover:bg-[#3b4252] transition"><FaTwitter /></a>
            <a href="#" className="bg-[#232936] p-2 rounded-full hover:bg-[#3b4252] transition"><FaFacebook /></a>
            <a href="#" className="bg-[#232936] p-2 rounded-full hover:bg-[#3b4252] transition"><FaInstagram /></a>
            <a href="#" className="bg-[#232936] p-2 rounded-full hover:bg-[#3b4252] transition"><FaYoutube /></a>
            <a href="#" className="bg-[#232936] p-2 rounded-full hover:bg-[#3b4252] transition"><FaGoogle /></a>
          </div>
          <div className="flex justify-end">
            <button className="bg-[#232936] p-3 rounded-xl shadow-lg hover:bg-[#3b4252] transition">
              <FaCog className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}