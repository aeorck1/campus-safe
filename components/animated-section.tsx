"use client"

import type { ReactNode } from "react"
import { useInView } from "react-intersection-observer"
import { useSpring, animated, config } from "@react-spring/web"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
  animation?: "fade" | "slide" | "scale" | "slideUp" | "slideDown"
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  threshold = 0.2,
  animation = "fade",
}: AnimatedSectionProps) {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
  })

  const getAnimationProps = () => {
    switch (animation) {
      case "slide":
        return {
          from: { opacity: 0, x: -50 },
          to: { opacity: inView ? 1 : 0, x: inView ? 0 : -50 },
        }
      case "scale":
        return {
          from: { opacity: 0, scale: 0.8 },
          to: { opacity: inView ? 1 : 0, scale: inView ? 1 : 0.8 },
        }
      case "slideUp":
        return {
          from: { opacity: 0, y: 50 },
          to: { opacity: inView ? 1 : 0, y: inView ? 0 : 50 },
        }
      case "slideDown":
        return {
          from: { opacity: 0, y: -50 },
          to: { opacity: inView ? 1 : 0, y: inView ? 0 : -50 },
        }
      case "fade":
      default:
        return {
          from: { opacity: 0 },
          to: { opacity: inView ? 1 : 0 },
        }
    }
  }

  const props = useSpring({
    ...getAnimationProps(),
    delay,
    config: config.gentle,
  })

  return (
    <animated.div ref={ref} style={props} className={className}>
      {children}
    </animated.div>
  )
}
