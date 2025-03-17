"use client"

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export function LandingHero() {
    const { data: session } = useSession();
    const router = useRouter();

    // method to handle CTA click
    const handleClick = async () => {
        if (session) {
            router.push('/dashboard');
        } else {
            toast.info("Signin/up to get started!")
        }
    }

    return (
        <section className="w-full py-12 lg:py-24">
            <div className=" px-6 lg:px-12">
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                    <motion.div
                        className="flex flex-col justify-center space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                Streamline Your Projects with WorkNest
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                The complete project management solution for teams of all sizes. Organize tasks, collaborate seamlessly,
                                and deliver projects on time.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Button size="lg" onClick={handleClick}>
                                {session ? "Dashboard" : "Get Started"}
                            </Button>
                        </div>
                    </motion.div>
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Image
                            src="/organizing-projects-animate.svg"
                            width={500}
                            height={500}
                            alt="Dashboard Preview"
                            className="w-full rounded-lg object-cover"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}