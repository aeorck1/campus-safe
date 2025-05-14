"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useSpring, animated, config } from "@react-spring/web"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  // Title animation
  const titleAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  })

  // Description animation
  const descriptionAnimation = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    delay: 300,
    config: config.gentle,
  })

  // Buttons animation
  const buttonsAnimation = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 600,
    config: config.gentle,
  })

  // Background gradient animation
  const gradientAnimation = useSpring({
    from: { backgroundPosition: "0% 50%" },
    to: { backgroundPosition: "100% 50%" },
    config: { duration: 20000 },
    loop: { reverse: true },
  })

  return (
    <section className="relative py-20 overflow-hidden">
      <animated.div
        style={gradientAnimation}
        className="absolute inset-0 bg-gradient-to-r from-campus-primary/10 via-campus-secondary/10 to-campus-accent/10 dark:from-campus-primary/5 dark:via-campus-secondary/5 dark:to-campus-accent/5 bg-[length:400%_100%]"
      />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <animated.h1
          style={titleAnimation}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-campus-primary to-campus-secondary"
        >
          Campus Incident Reporting Platform
        </animated.h1>
        <animated.p
          style={descriptionAnimation}
          className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-muted-foreground"
        >
          Report, track, and resolve campus incidents in real-time. Help keep our campus safe and secure for everyone.
        </animated.p>
        <animated.div style={buttonsAnimation} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/report">
              Report an Incident
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/incidents">View Incidents</Link>
          </Button>
        </animated.div>
      </div>
    </section>
  )
}
