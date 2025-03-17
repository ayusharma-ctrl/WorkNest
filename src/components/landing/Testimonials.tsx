"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { testimonials } from "@/lib/constants";


export function LandingTestimonials() {
    return (
        <section id="feedbacks" className="w-full py-12 md:py-24 lg:py-32">
            <div className="px-6 lg:px-12">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by Teams Worldwide</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            See what our customers have to say about WorkNest.
                        </p>
                    </div>
                </div>
                <motion.div
                    className="flex items-center justify-center w-1/4 mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Image
                        src="/feedback-animate.svg"
                        width={200}
                        height={200}
                        alt="Feedback Preview"
                        className="w-full rounded-lg object-cover"
                    />
                </motion.div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-center text-muted-foreground">&quot;{testimonial.quote}&quot;</p>
                            <div className="flex flex-col items-center space-y-2">
                                <Avatar>
                                    {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                                    <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <h3 className="font-bold">{testimonial.author}</h3>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}