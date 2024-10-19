'use client'
import Link from "next/link";
import { usePathname } from 'next/navigation';

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
    return (
        <div className="font-sans bg-gray-50 flex">
            {/* Left side navigation */}
            <nav className="w-64 bg-gray-100 min-h-screen shadow-md flex flex-col">
                <Link href="/" className="p-4">
                    <p className="text-2xl font-bold text-gray-900">TEDxSDG</p>
                </Link>
                <ul className="space-y-2 p-4">
                    <li><NavItem href="/generate/inspiration">Inspiration</NavItem></li>
                    <li><NavItem href="/generate/planning">Planning</NavItem></li>
                    <li><NavItem href="/generate/funding">Funding</NavItem></li>
                    <li><NavItem href="/generate/distribution">Distribution</NavItem></li>
                </ul>
            </nav>

            <div className="flex-1 flex flex-col">
                <header className="bg-transparent shadow-lg">
                    <nav className="flex items-center justify-between px-6 py-4">
                        <h1 className="text-xl font-semibold text-gray-800">Business Name</h1>
                        {/* <div className="flex items-center space-x-4">
                            Auth
                        </div> */}
                    </nav>
                </header>

                {/* Content */}
                <main className="flex-1 pt-4 px-6">{children}</main>
            </div>
        </div>
    );
}
