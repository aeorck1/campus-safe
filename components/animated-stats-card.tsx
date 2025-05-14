"use client"

import { useSpring, animated, config } from "@react-spring/web"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnimatedStatsCardProps {
  value: number
  label: string
  color: string
  delay?: number
  suffix?: string
}

export function AnimatedStatsCard({ value, label, color, delay = 0, suffix = "" }: AnimatedStatsCardProps) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay,
    config: config.molasses,
  })

  const cardAnimation = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  })

  return (
    <animated.div style={cardAnimation}>
      <Card className={`feature-card border-${color}/20`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-2xl font-bold text-${color}`}>
            <animated.span>{number.to((n) => Math.floor(n).toString())}</animated.span>
            {suffix}
          </CardTitle>
          <CardDescription>{label}</CardDescription>
        </CardHeader>
      </Card>
    </animated.div>
  )
}
