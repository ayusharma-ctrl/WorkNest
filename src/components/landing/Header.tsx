"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";


export const Header = () => {
    const { data: session, status } = useSession();

    // method to signin user using Github account
    const handleGithubSignIn = async () => {
        try {
            await signIn("github");
        } catch (error) {
            console.log(error);
            toast.error("Error", {
                description: "An error occurred. Please try again.",
            });
        }
    }

    // method to signout authenticated user
    const handleGithubSignout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.log(error);
            toast.error("Error", {
                description: "An error occurred. Please try again.",
            });
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full px-6 lg:px-12 lg:py-2 border-b bg-transparent backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold">WorkNest</span>
                    </Link>
                </div>
                <nav className="flex items-center gap-4">
                    <Link href="#features" className="text-sm font-medium hover:underline">
                        Features
                    </Link>
                    <Link href="#feedbacks" className="text-sm font-medium hover:underline">
                        Feedbacks
                    </Link>
                    {/* <Link href="/pricing" className="text-sm font-medium hover:underline">
                        Pricing
                    </Link> */}
                    {/* <Link href="/about" className="text-sm font-medium hover:underline">
                        About
                    </Link> */}
                    {status === "loading" ? <span>Loading...</span> : session ? (
                        <div className="flex items-center gap-2">
                            <Button asChild size={"sm"}>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <Button variant={"destructive"} size={"sm"} onClick={handleGithubSignout}>
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleGithubSignIn}>
                            Sign In
                        </Button>
                    )}
                </nav>
            </div>
        </header>
    )
}
