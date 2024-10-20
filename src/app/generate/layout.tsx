'use client'
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { useState } from "react";

const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`p-2 rounded block ${isActive
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
                }`}
        >
            {children}
        </Link>
    );
};

export default function GenerateLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [openProfile, setOpenProfile] = useState(false)

    return (
        <div className="font-sans bg-gray-50 flex">
            {/* Left side navigation */}
            <nav className="w-64 bg-gray-100 min-h-screen shadow-md flex flex-col">
                <Link href="/" className="p-4">
                    <p className="text-2xl font-bold text-gray-900">TEDxSDG</p>
                </Link>
                <ul className="space-y-2 p-4">
                    <li><NavItem href="/generate/inspiration">1. Inspiration</NavItem></li>
                    <li><NavItem href="/generate/planning">2. Planning</NavItem></li>
                    <li><NavItem href="/generate/funding">3. Funding</NavItem></li>
                    <li><NavItem href="/generate/distribution">4. Distribution</NavItem></li>
                </ul>
            </nav>

            <div className="flex-1 flex flex-col">
                <header className="bg-transparent shadow-lg">
                    <nav className="flex items-center justify-between px-6 py-4">
                        <h1 className="text-xl font-semibold text-gray-800">Business Name</h1>
                        <div className="relative">
                            <div 
                                onClick={() => setOpenProfile(!openProfile)} 
                                className="bg-gray-200 rounded-full p-2 cursor-pointer"
                            >
                                <User className="text-gray-600" />
                            </div>
                            {openProfile && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <Link href={'/'} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                        Projects
                                    </Link>
                                    <Link href={'/'} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                        Settings
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Content */}
                <main className="flex-1 pt-4 px-6">{children}</main>
            </div>
        </div>
    );
}
