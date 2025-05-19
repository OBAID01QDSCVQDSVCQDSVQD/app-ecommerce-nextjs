import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaUser, FaShoppingCart, FaGlobe } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#131921] text-white w-full">
      <div className="flex items-center justify-between px-4 py-1 w-full h-16">
        {/* يسار */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-1 mr-2">
            <Image src="/icones/logo.svg" alt="Logo" width={60} height={40} className="object-contain" />
          </Link>
          <div className="hidden md:flex flex-col items-start justify-center px-2 cursor-pointer hover:underline">
            <span className="text-xs text-gray-300 leading-none flex items-center gap-1">
              <FaMapMarkerAlt className="inline-block mr-1 text-lg text-white" />
              Deliver to
            </span>
            <span className="font-bold text-sm text-white leading-none">Tunisia</span>
          </div>
        </div>
        {/* وسط */}
        <form className="flex flex-1 mx-4 h-10 max-w-2xl">
          <select className="rounded-l-md bg-gray-100 text-gray-700 px-2 border-r border-gray-300 focus:outline-none text-xs w-16 h-full">
            <option>All</option>
          </select>
          <input
            type="text"
            placeholder="Search Amazon"
            className="flex-1 px-4 py-1 bg-white text-black focus:outline-none text-sm h-full"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-yellow-400 text-black px-4 rounded-r-md flex items-center justify-center h-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </form>
        {/* يمين */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 px-2 cursor-pointer hover:underline">
            <FaGlobe className="text-xl" />
            <span className="text-xs font-bold">EN</span>
          </div>
          <div className="hidden md:flex flex-col items-start px-2 cursor-pointer hover:underline">
            <span className="text-xs">Hello, sign in</span>
            <span className="font-bold text-sm">Account & Lists</span>
          </div>
          <div className="hidden md:flex flex-col items-start px-2 cursor-pointer hover:underline">
            <span className="text-xs">Returns</span>
            <span className="font-bold text-sm">& Orders</span>
          </div>
          <Link href="/cart" className="flex items-center gap-1 px-2 hover:text-[#febd69] transition">
            <div className="relative">
              <FaShoppingCart className="w-7 h-7" />
              <span className="absolute -top-2 left-4 bg-[#febd69] text-black text-xs font-bold rounded-full px-1">0</span>
            </div>
            <span className="font-bold text-sm mt-2 hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}