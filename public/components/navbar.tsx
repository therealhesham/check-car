// components/Navbar.js

import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-white text-2xl font-bold">
          <a href="/">Rawaes</a>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex space-x-8 text-white">
          <a href="/" className="hover:text-gray-400">الرئيسية</a>
          <a href="/history" className="hover:text-gray-400">السجل</a>
          <a href="/cheak-in" className="hover:text-gray-400">تشييك دخول</a>
          <a href="/cheak-out" className="hover:text-gray-400">تشييك خروج</a>
        </div>

        {/* Hamburger for Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Nav Links */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 text-white px-4 py-2 space-y-4">
          <a href="/" className="block">الرئيسية</a>
          <a href="/history" className="block">السجل</a>
          <a href="/cheak-in" className="block">تشييك دخول</a>
          <a href="/cheak-out" className="block">تشييك خروج</a>
        </div>
      )}
    </nav>
  );
}
