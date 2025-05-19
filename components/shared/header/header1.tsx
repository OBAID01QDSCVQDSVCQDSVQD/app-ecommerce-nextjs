import { FaFacebook, FaInstagram, FaTwitter, FaMoon } from 'react-icons/fa';

export default function TopHeader() {
  return (
    <div className="w-full bg-[#2d3442] text-white text-sm h-10 flex items-center justify-between px-6">
      {/* يسار */}
      <div className="flex items-center gap-3">
        <span className="bg-[#232936] text-xs font-bold px-3 py-1 rounded-full">HOT</span>
        <span>Free Express Shipping</span>
      </div>
      {/* يمين */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 focus:outline-none" aria-label="Toggle dark mode">
          <FaMoon className="text-lg" />
        </button>
        <a href="#" className="hover:text-gray-300"><FaTwitter /></a>
        <a href="#" className="hover:text-gray-300"><FaFacebook /></a>
        <a href="#" className="hover:text-gray-300"><FaInstagram /></a>
      </div>
    </div>
  );
}
