'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function UserButton() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className="flex flex-col items-start px-2 cursor-pointer hover:underline focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        <span className="text-xs">
          Hello, {session ? session.user?.name || session.user?.email : 'sign in'}
        </span>
        <span className="font-bold text-sm flex items-center gap-1">
          Account & Lists <ChevronDown className="w-4 h-4 inline" />
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded shadow-lg z-50 border border-gray-200 py-2 min-w-[180px]">
          {session ? (
            <>
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="font-bold">{session.user?.name}</div>
                <div className="text-xs text-gray-500">{session.user?.email}</div>
              </div>
              <Link href="/account" className="block px-4 py-2 hover:bg-gray-100">Your account</Link>
              <Link href="/account/orders" className="block px-4 py-2 hover:bg-gray-100">Your orders</Link>
              {session.user?.role === 'Admin' && (
                <Link href="/admin/overview" className="block px-4 py-2 hover:bg-gray-100">Admin</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="block px-4 py-2 hover:bg-gray-100 font-bold text-blue-600">Sign in</Link>
              <div className="px-4 py-2 text-xs text-gray-500">New Customer?</div>
              <Link href="/sign-up" className="block px-4 py-2 hover:bg-gray-100">Create your account</Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
