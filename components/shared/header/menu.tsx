import Link from 'next/link'
import data from '@/lib/data'
import { MenuIcon } from 'lucide-react'

export default function Menu() {
  return (
    <div className="w-full bg-[#232F3E] h-10 flex items-center px-4">
      <nav className="flex gap-2 items-center h-full">
        {/* أول عنصر: أيقونة Menu مع All */}
        <Link href="#" className="flex items-center gap-1 text-white font-bold px-2 py-1 hover:text-yellow-400 transition h-full">
          <MenuIcon className="w-5 h-5" />
          <span>All</span>
        </Link>
        {/* باقي عناصر القائمة */}
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
  )
}
