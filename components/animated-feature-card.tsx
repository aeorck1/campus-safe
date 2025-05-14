"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useSpring, animated } from "@react-spring/web"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnimatedFeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  link: string
  linkText: string
  iconBgColor: string
  delay?: number
}

export function AnimatedFeatureCard({
  icon,
  title,
  description,
  link,
  linkText,
  iconBgColor,
  delay = 0,
}: AnimatedFeatureCardProps) {
  const animation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    delay,
    config: { tension: 280, friction: 20 },
  })

  const hoverAnimation = useSpring({
    from: { transform: "scale(1)" },
    to: { transform: "scale(1)" },
    config: { tension: 300, friction: 10 },
  })

  return (
    <animated.div style={{ ...animation, ...hoverAnimation }}>
      <Card
        className="feature-card h-full"
        onMouseEnter={() => hoverAnimation.transform.set("scale(1.03)")}
        onMouseLeave={() => hoverAnimation.transform.set("scale(1)")}
      >
        <CardHeader>
          <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center mb-4`}>{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="ghost" asChild className="w-full">
            <Link href={link}>{linkText}</Link>
          </Button>
        </CardFooter>
      </Card>
    </animated.div>
  )
}
