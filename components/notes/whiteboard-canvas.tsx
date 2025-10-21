"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Eraser, Square, Circle, Trash2, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface WhiteboardCanvasProps {
  canvasData?: any
  onSave: (data: any) => void
}

type Tool = "pen" | "eraser" | "rectangle" | "circle" | "text"

export function WhiteboardCanvas({ canvasData, onSave }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>("pen")
  const [color, setColor] = useState("#2563eb")
  const [lineWidth, setLineWidth] = useState(2)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Load saved canvas data
    if (canvasData?.imageData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = canvasData.imageData
    }
  }, [canvasData])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pen") {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "eraser") {
      ctx.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth * 2, lineWidth * 2)
    }
  }

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "rectangle") {
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y)
    } else if (tool === "circle") {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
      ctx.beginPath()
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    setIsDrawing(false)
    saveCanvas()
  }

  const saveCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL()
    onSave({ imageData })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveCanvas()
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "whiteboard.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const tools = [
    { name: "pen", icon: Pencil, label: "Pen" },
    { name: "eraser", icon: Eraser, label: "Eraser" },
    { name: "rectangle", icon: Square, label: "Rectangle" },
    { name: "circle", icon: Circle, label: "Circle" },
  ]

  const colors = ["#2563eb", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#000000"]

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {tools.map((t) => (
            <Button
              key={t.name}
              variant={tool === t.name ? "default" : "outline"}
              size="icon"
              onClick={() => setTool(t.name as Tool)}
              title={t.label}
            >
              <t.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                color === c ? "border-foreground scale-110" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="icon" onClick={clearCanvas} title="Clear canvas">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={downloadCanvas} title="Download">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 bg-secondary/10">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-white rounded-lg shadow-sm cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  )
}
