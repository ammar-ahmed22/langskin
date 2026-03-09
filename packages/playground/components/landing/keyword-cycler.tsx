"use client"

import { useState, useEffect } from "react"

const phrases = ["your words.", "español.", "français.", "your own DSL."]

export function KeywordCycler() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      const switchTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length)
        setVisible(true)
      }, 250)
      return () => clearTimeout(switchTimer)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <span
      style={{ transition: "opacity 250ms ease" }}
      className={`text-sky-400 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {phrases[index]}
    </span>
  )
}
