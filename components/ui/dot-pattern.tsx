"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"

export interface DotPatternProps {
  className?: string
  children?: React.ReactNode
  /** Dot diameter in pixels */
  dotSize?: number
  /** Gap between dots in pixels */
  gap?: number
  /** Base dot color (hex) */
  baseColor?: string
  /** Glow color on hover (hex) */
  glowColor?: string
  /** Mouse proximity radius for highlighting */
  proximity?: number
  /** Glow intensity multiplier */
  glowIntensity?: number
  /** Wave animation speed (0 to disable) */
  waveSpeed?: number
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

interface Dot {
  x: number
  y: number
  baseOpacity: number
}

interface Ripple {
  x: number
  y: number
  birth: number
  duration: number
  radius: number
}

export function DotPattern({
  className,
  children,
  dotSize = 2,
  gap = 24,
  baseColor = "#404040",
  glowColor = "#22d3ee",
  proximity = 120,
  glowIntensity = 1,
  waveSpeed = 0.5,
}: DotPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animationRef = useRef<number>(null)
  const startTimeRef = useRef(Date.now())
  const ripplesRef = useRef<Ripple[]>([])
  const lastRippleRef = useRef(0)

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor])
  const glowRgb = useMemo(() => hexToRgb(glowColor), [glowColor])

  const buildGrid = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext("2d")
    if (ctx) ctx.scale(dpr, dpr)

    const cellSize = dotSize + gap
    const cols = Math.ceil(rect.width / cellSize) + 1
    const rows = Math.ceil(rect.height / cellSize) + 1

    const offsetX = (rect.width - (cols - 1) * cellSize) / 2
    const offsetY = (rect.height - (rows - 1) * cellSize) / 2

    const dots: Dot[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push({
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          baseOpacity: 0.3 + Math.random() * 0.2,
        })
      }
    }
    dotsRef.current = dots
  }, [dotSize, gap])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

    const { x: mx, y: my } = mouseRef.current
    const proxSq = proximity * proximity
    const now = Date.now()
    const canvasW = canvas.width / dpr
    const canvasH = canvas.height / dpr

    // Spawn new ripples
    if (now - lastRippleRef.current > 800 + Math.random() * 1200) {
      ripplesRef.current.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        birth: now,
        duration: 2000 + Math.random() * 1500,
        radius: 80 + Math.random() * 100,
      })
      lastRippleRef.current = now
    }

    // Remove expired ripples
    ripplesRef.current = ripplesRef.current.filter((r) => now - r.birth < r.duration)

    for (const dot of dotsRef.current) {
      const dx = dot.x - mx
      const dy = dot.y - my
      const distSq = dx * dx + dy * dy

      let opacity = dot.baseOpacity
      let scale = 1
      let r = baseRgb.r
      let g = baseRgb.g
      let b = baseRgb.b
      let glow = 0

      // Ripple effects
      for (const ripple of ripplesRef.current) {
        const rdx = dot.x - ripple.x
        const rdy = dot.y - ripple.y
        const dist = Math.sqrt(rdx * rdx + rdy * rdy)
        if (dist > ripple.radius) continue

        const progress = (now - ripple.birth) / ripple.duration
        // fade in then out
        const life = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7
        // closer to center = stronger
        const proximity_t = 1 - dist / ripple.radius
        const intensity = life * proximity_t * proximity_t

        r = Math.round(r + (glowRgb.r - r) * intensity)
        g = Math.round(g + (glowRgb.g - g) * intensity)
        b = Math.round(b + (glowRgb.b - b) * intensity)
        opacity = Math.min(1, opacity + intensity * 0.6)
        scale = Math.max(scale, 1 + intensity * 0.6)
        glow = Math.max(glow, intensity * 0.5)
      }

      // Mouse proximity effect
      if (distSq < proxSq) {
        const dist = Math.sqrt(distSq)
        const t = 1 - dist / proximity
        const easedT = t * t * (3 - 2 * t) // smoothstep

        // Interpolate color
        r = Math.round(baseRgb.r + (glowRgb.r - baseRgb.r) * easedT)
        g = Math.round(baseRgb.g + (glowRgb.g - baseRgb.g) * easedT)
        b = Math.round(baseRgb.b + (glowRgb.b - baseRgb.b) * easedT)

        opacity = Math.min(1, opacity + easedT * 0.7)
        scale = scale + easedT * 0.8
        glow = easedT * glowIntensity
      }

      const radius = (dotSize / 2) * scale

      // Draw glow
      if (glow > 0) {
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, radius * 4)
        gradient.addColorStop(0, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, ${glow * 0.4})`)
        gradient.addColorStop(0.5, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, ${glow * 0.1})`)
        gradient.addColorStop(1, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0)`)
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, radius * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Draw dot
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
      ctx.fill()
    }

    animationRef.current = requestAnimationFrame(draw)
  }, [proximity, baseRgb, glowRgb, dotSize, glowIntensity])

  useEffect(() => {
    buildGrid()

    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(buildGrid)
    ro.observe(container)

    return () => ro.disconnect()
  }, [buildGrid])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [draw])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("fixed inset-0 overflow-hidden bg-neutral-950", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(10,10,10,0.6) 100%)",
        }}
      />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function DotPatternDemo() {
  return <DotPattern />
}
