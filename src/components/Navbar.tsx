import Link from "next/link"
import DesktopNavbar from "./DesktopNavbar"
import MobileNavbar from "./MobileNavbar"
import { currentUser } from "@clerk/nextjs/server"
import { syncUser } from "@/actions/user.action"

export async function Navbar() {
    const user = await currentUser()
    if (user) await syncUser()
    const email = user?.emailAddresses[0].emailAddress
    return (
        <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur-2xl
        supports-[backdrop-filter]:bg-background/60 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-primary font-mono tracking-wider">
                            Chatterly
                        </Link>
                    </div>
                    <DesktopNavbar />
                    <MobileNavbar username={user?.username ?? undefined} email={email} />
                </div>
            </div>
        </nav>
    )
}