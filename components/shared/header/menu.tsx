'use client'

import Link from 'next/link'
import data from '@/lib/data'
import { MenuIcon, X } from 'lucide-react'
import { useState } from 'react'
import CartButton from './cart-button'
import UserButton from './user-button'

export default function Menu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* شريط المينيو */}
      <div className="w-full bg-[#232F3E] h-10 flex items-center px-4">
        {/* زر All للشاشات الصغيرة */}
        <button
          className="flex items-center gap-1 text-white font-bold px-2 py-1 hover:text-yellow-400 transition h-full md:hidden"
          onClick={() => setOpen(true)}
        >
          <MenuIcon className="w-5 h-5" />
          <span>All</span>
        </button>
        {/* القائمة الأفقية للشاشات المتوسطة وما فوق */}
        <nav className="gap-2 items-center h-full hidden md:flex">
          <Link href="#" className="flex items-center gap-1 text-white font-bold px-2 py-1 hover:text-yellow-400 transition h-full">
            <MenuIcon className="w-5 h-5" />
            <span>All</span>
          </Link>
          {data.headerMenus.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white hover:text-yellow-400 font-medium px-2 py-1 transition h-full"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      {/* النافذة الجانبية (Drawer) */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* خلفية شفافة لإغلاق النافذة */}
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          {/* محتوى النافذة */}
          <div className="relative bg-[#232F3E] w-64 h-full shadow-lg animate-slideInLeft p-6 flex flex-col">
            <button className="absolute top-2 right-2 text-white" onClick={() => setOpen(false)} aria-label="Fermer">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <MenuIcon className="w-5 h-5" />
              Menu
            </h2>
            <nav className="flex flex-col gap-3">
              {data.headerMenus.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-yellow-400 font-medium px-2 py-2 rounded transition"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className='flex justify-end'>
              <nav className='flex gap-3 w-full'>
                <CartButton />
                <UserButton />
              </nav>
            </div>
          </div>
        </div>
      )}
      {/* أنيميشن للنافذة */}
      <style jsx global>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </>
  )
}

