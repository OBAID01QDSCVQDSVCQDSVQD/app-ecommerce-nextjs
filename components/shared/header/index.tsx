'use client'
import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaUser, FaShoppingCart, FaGlobe } from 'react-icons/fa';
import Menu from './menu';
import { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('EN');
  const user = null; // غيّرها لاحقًا حسب حالة تسجيل الدخول
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#131921] text-white w-full">
      <div className="flex items-center justify-between px-2 md:px-4 py-1 w-full h-12 md:h-16">
        {/* يسار */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-1 mr-1 md:mr-2">
            <Image src="/icones/logo.svg" alt="Logo" width={40} height={28} className="object-contain md:w-[60px] md:h-[40px] w-[40px] h-[28px]" />
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
        <form className="flex flex-1 mx-2 md:mx-4 h-8 md:h-10 max-w-xs md:max-w-2xl">
          <select className="rounded-l-md bg-gray-100 text-gray-700 px-2 border-r border-gray-300 focus:outline-none text-xs w-12 md:w-16 h-full">
            <option>All</option>
          </select>
          <input
            type="text"
            placeholder="Search Amazon"
            className="flex-1 px-2 md:px-4 py-1 bg-white text-black focus:outline-none text-xs md:text-sm h-full"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-yellow-400 text-black px-2 md:px-4 rounded-r-md flex items-center justify-center h-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </form>
        {/* يمين */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* عناصر اليمين تظهر فقط في md وما فوق */}
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
          {/* أيقونة السلة فقط في الجوال */}
          <Link href="/cart" className="flex items-center gap-1 px-1 md:px-2 hover:text-[#febd69] transition">
            <div className="relative">
              <FaShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
              <span className="absolute -top-2 left-4 bg-[#febd69] text-black text-xs font-bold rounded-full px-1">0</span>
            </div>
            <span className="font-bold text-xs md:text-sm mt-2 hidden md:inline">Cart</span>
          </Link>
          {/* أيقونة الثلاث نقاط للجوال */}
          <button className="block md:hidden ml-1 p-2" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>
      <Menu />
      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-[#232F3E] w-64 h-full shadow-lg animate-slideInRight p-6 flex flex-col">
            <button className="absolute top-2 right-2 text-white" onClick={() => setDrawerOpen(false)} aria-label="Fermer">
              <span className="text-2xl">&times;</span>
            </button>
            <div className="mb-6 mt-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-white">Utilisateur</span>
                  <button className="text-left text-red-400 hover:underline" onClick={() => {}}>
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <button className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-500 mb-2" onClick={() => {}}>
                  Se connecter
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 mb-6">
              {isMounted && (
                <>
                  <button
                    className="flex items-center gap-1 text-white hover:text-yellow-400 font-bold px-2 py-1 rounded transition border border-gray-600"
                    onClick={() => setLang(lang === 'EN' ? 'FR' : 'EN')}
                  >
                    <FaGlobe />
                    <span>{lang}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 text-white hover:text-yellow-400 font-bold px-2 py-1 rounded transition border border-gray-600"
                    onClick={toggleTheme}
                  >
                    {darkMode ? <FaSun /> : <FaMoon />}
                    <span>{darkMode ? 'Light' : 'Dark'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </header>
  );
}