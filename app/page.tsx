"use client"
import Link from "next/link"
import { ArrowRight, Bell, CheckCircle, MapPin, Shield, Users } from "lucide-react"
import { useSpring, animated, config, useTrail, useInView } from "@react-spring/web"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import {useAuthStore} from "@/lib/auth"
import SubscribePage from "./subscribe/page"
import { set } from "zod"


// Dynamically import the CampusMap component with no SSR
const CampusMap = dynamic(() => import("@/components/map/campus-map").then((mod) => mod.CampusMap), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-md overflow-hidden bg-muted flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

//import useAuthStore for getPublicStats


// Animated number counter component
function AnimatedCounter({ n, delay = 0 }: { n: number; delay?: number }) {
  const { number } = useSpring({
    from: { number: 0 },
    number: n,
    delay,
    config: { mass: 1, tension: 20, friction: 10 },
  })

  return <animated.div>
    {number.to((value) => Number(value).toFixed(0))}
  </animated.div>
}

// Add these images to your public folder or use URLs
const heroImages = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
]

export default function LandingPage() {
  // For the hero section
  const stateCount = 0
  const [totalIncidents, setTotalIncidents] = useState(stateCount)
  const [resolvedIncidents, setResolvedIncidents] = useState(stateCount)
  const [investigatingIncidents, setInvestigatingIncidents] = useState(stateCount)
  const [activeIncidents, setActiveIncidents]= useState(stateCount)
  const [incidents, setIncidents] = useState<[]>([])
  const [showSubscribe, setShowSubscribe] = useState(true)
  

  const publicStats = useAuthStore((state) => state.getPublicStats)
  const incidentsMap = useAuthStore((state)=>state.incidents)

    // Only show if not already subscribed
useEffect(() => {
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith("secure_ui")) {
        setShowSubscribe(false);
        break;
      }
    }
  }
}, []);


  useEffect(() => {
    // Fetch incidents when the component mounts
    const fetchIncidents = async () => {
      try {
        const data = await incidentsMap()
        console.log("Here are the incident data", data.data)
        setIncidents(data.data)
      } catch (error) {
        console.error("Failed to fetch incidents:", error)
      }
    }
    fetchIncidents()
  }, [incidentsMap])
  useEffect(() => {
    // Fetch public stats when the component mounts
    const fetchStats = async () => {
      try {
        const data = await publicStats()
        console.log("Public stats data:", data.data)
        setTotalIncidents(data.data?.total_incidents || 0)
        setResolvedIncidents(data.data?.resolved_incidents || 0)
        setInvestigatingIncidents(data.data?.investigating_incidents||0)
        setActiveIncidents(data.data?.active_incidents || 0)
      } catch (error) {
        console.error("Failed to fetch public stats:", error)
      }
    }
    fetchStats()
  }, [])

  // Hero image slider state
  const [currentHeroImage, setCurrentHeroImage] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const heroAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  })

  // For the stats section
  const [statsRef, statsInView] = useInView({
    once: true,
    rootMargin: "-100px 0px",
  })

  const statsAnimation = useSpring({
    opacity: statsInView ? 1 : 0,
    y: statsInView ? 0 : 50,
    config: config.gentle,
  })

  // For the map section
  const [mapRef, mapInView] = useInView({
    once: true,
    rootMargin: "-100px 0px",
  })

  const mapAnimation = useSpring({
    opacity: mapInView ? 1 : 0,
    scale: mapInView ? 1 : 0.9,
    config: config.gentle,
  })

  // For the features section
  const [featuresRef, featuresInView] = useInView({
    once: true,
    rootMargin: "-100px 0px",
  })

  const featureCards = [
    {
      icon: <Bell className="h-6 w-6 text-campus-primary" />,
      title: "Anonymous Reporting",
      description: "Report incidents anonymously with detailed information and location data to ensure privacy and safety.",
      link: "/report",
      linkText: "Report Anonymously",
      color: "bg-campus-primary/10",
    },
    {
      icon: <MapPin className="h-6 w-6 text-campus-secondary" />,
      title: "Interactive Map",
      description: "View incidents on an interactive map to understand safety patterns across campus.",
      link: "/map",
      linkText: "Explore Map",
      color: "bg-campus-secondary/10",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-campus-accent" />,
      title: "Status Tracking",
      description: "Track the status of reported incidents from submission to resolution with real-time updates.",
      link: "/incidents",
      linkText: "View Incidents",
      color: "bg-campus-accent/10",
    },
    {
      icon: <Users className="h-6 w-6 text-campus-warning" />,
      title: "Community Engagement",
      description: "Upvote incidents, add comments, and collaborate with others to improve campus safety.",
      link: "/incidents",
      linkText: "Join Discussion",
      color: "bg-campus-warning/10",
    }

  ]
  const featureTrail = useTrail(featureCards.length, {
    opacity: featuresInView ? 1 : 0,
    y: featuresInView ? 0 : 50,
    config: config.gentle,
  })

  // For the CTA section
  const [ctaRef, ctaInView] = useInView({
    once: true,
    rootMargin: "-100px 0px",
  })

  const ctaAnimation = useSpring({
    opacity: ctaInView ? 1 : 0,
    scale: ctaInView ? 1 : 0.9,
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
    <div className="flex-1 space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center py-20">
        {/* Image Slider */}
        <div className="absolute inset-0 z-0 h-full w-full">
          {heroImages.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt={`Campus scene ${idx + 1}`}
              className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-1000 ${idx === currentHeroImage ? "opacity-100" : "opacity-0"}`}
              style={{ zIndex: idx === currentHeroImage ? 1 : 0 }}
            />
          ))}
          {/* Solid black overlay for readability */}
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: 0.7, zIndex: 2 }}
          />
          {/* Optional: Slider dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${idx === currentHeroImage ? "bg-campus-primary" : "bg-white/60"}`}
                onClick={() => setCurrentHeroImage(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        <animated.div
          style={gradientAnimation}
          className="absolute inset-0 bg-gradient-to-r from-campus-primary/10 via-campus-secondary/10 to-campus-accent/10 dark:from-campus-primary/5 dark:via-campus-secondary/5 dark:to-campus-accent/5 bg-[length:400%_100%]"
        />
        <div className="container relative z-10 mx-auto px-4 text-center flex flex-col items-center justify-center h-full">
          <animated.h1
            style={heroAnimation}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-white drop-shadow-lg"
          >
            Campus Incident Reporting Platform
          </animated.h1>
          <animated.p
            style={useSpring({
              from: { opacity: 0, y: 50 },
              to: { opacity: 1, y: 0 },
              delay: 300,
              config: config.gentle,
            })}
            className="text-base sm:text-lg md:text-2xl max-w-full sm:max-w-3xl mx-auto mb-6 sm:mb-10 text-white/90 drop-shadow"
          >
            Report, track, and resolve campus incidents in real-time. Help keep our campus safe and secure for everyone.
          </animated.p>
          <animated.div
            style={useSpring({
              from: { opacity: 0, y: 50 },
              to: { opacity: 1, y: 0 },
              delay: 600,
              config: config.gentle,
            })}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-xs sm:max-w-none mx-auto"
          >
            <Button
              size="lg"
              asChild
              className="text-white w-full sm:w-auto"
            >
              <Link href="/report">
                Report an Incident
                <ArrowRight className="ml-2 h-5 w-5 filter-invert-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto hover:bg-blue-400 hover:text-white"
            >
              <Link href="/incidents">View Incidents</Link>
            </Button>
          </animated.div>
        </div>
      </section>


  {/* Features Section */}
      <section ref={featuresRef} className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Platform Highlights</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools needed to report, track, and resolve campus incidents
            efficiently.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-8 justify">
          {featureTrail.map((style, index) => (
            <animated.div key={index} style={style}>
              <Card className="feature-card h-full transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-full ${featureCards[index].color} flex items-center justify-center mb-4`}
                  >
                    {featureCards[index].icon}
                  </div>
                  <CardTitle>{featureCards[index].title}</CardTitle>
                  <CardDescription>{featureCards[index].description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" asChild className="w-full hover:bg-campus-primary/10">
                    <Link href={featureCards[index].link} className="text-campus-primary hover:text-campus-secondary">{featureCards[index].linkText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </animated.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <animated.section ref={statsRef} style={statsAnimation} className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Incident Statistics</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with real-time statistics on reported incidents, resolutions, and campus safety trends.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">     
          <Card className="feature-card border-campus-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-campus-primary">
                <AnimatedCounter n={totalIncidents} />
              </CardTitle>
              <CardDescription>Total Incidents Reported</CardDescription>
            </CardHeader>
          </Card>
          <Card className="feature-card border-campus-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-campus-secondary">
                <AnimatedCounter n={resolvedIncidents} delay={200} />
              </CardTitle>
              <CardDescription>Incidents Resolved</CardDescription>
            </CardHeader>
          </Card>
          <Card className="feature-card border-campus-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-campus-warning flex">
                {investigatingIncidents}
              </CardTitle>
              <CardDescription>Investigating Incident</CardDescription>
            </CardHeader>
          </Card>
          <Card className="feature-card border-campus-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-campus-accent flex">
                {activeIncidents}
              </CardTitle>
              <CardDescription>Active Incident</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </animated.section>

      {/* Map Preview Section */}
      <animated.section ref={mapRef} style={mapAnimation} className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Real-time Incident Map</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            View and track incidents across campus with our interactive map. Get real-time updates on safety concerns
            and resolved issues.
          </p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="h-[500px] rounded-md overflow-hidden">
              <CampusMap incidents={incidents?.slice(0, 10)} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center p-6">
            <Button asChild>
              <Link href="/map">
                View Full Map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </animated.section>

      {/* Subscription Section */}
      {/* <section className="container mx-auto px-4">
        <SubscribePage />
      </section> */}

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="bg-gradient-to-r from-campus-primary via-campus-secondary to-campus-primary bg-[length:200%_100%] py-16"
        style={{
          ...ctaAnimation,
          backgroundPosition: useSpring({
            from: { backgroundPosition: "0% 50%" },
            to: { backgroundPosition: "100% 50%" },
            config: { duration: 15000 },
            loop: { reverse: true },
          }).backgroundPosition.get(),
        }}
      >
        <div className="container mx-auto px-4 text-center bg-gradient-to-r from-campus-primary via-campus-secondary to-campus-primary bg-[length:200%_100%] py-16">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to help keep our campus safe?</h2>
          <p className="text-white/90 text-xl max-w-2xl mx-auto mb-8">
            Join our community effort to create a safer environment for everyone. Report incidents, stay informed, and
            be part of the solution.
          </p>
            {(() => {
            const buttonSpring = useSpring({
              from: { scale: 1 },
              to: { scale: 1.05 },
              config: { duration: 2000 },
              loop: { reverse: true },
            });
            return (
              <animated.div style={buttonSpring} className="flex justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-white text-campus-primary hover:bg-white/90 w-full max-w-xs sm:max-w-md md:max-w-lg"
              >
                <Link href="/report" className="block w-full text-center">
                Report an Incident Now
                </Link>
              </Button>
              </animated.div>
            );
            })()}
        </div>
      </section>

  
      {showSubscribe && (
        <SubscribePage onClose={() => setShowSubscribe(false)} />
      )}
    </div>
  )
}
