"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Save, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Node {
  id: string
  type: "start" | "process" | "decision" | "end"
  x: number
  y: number
  label: string
}

interface Connection {
  from: string
  to: string
}

interface FlowCanvasProps {
  flowData?: { nodes: Node[]; connections: Connection[] }
  onSave: (data: { nodes: Node[]; connections: Connection[] }) => void
}

export function FlowCanvas({ flowData, onSave }: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<Node[]>(flowData?.nodes || [])
  const [connections, setConnections] = useState<Connection[]>(flowData?.connections || [])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)

  useEffect(() => {
    if (flowData) {
      setNodes(flowData.nodes || [])
      setConnections(flowData.connections || [])
    }
  }, [flowData])

  const addNode = (type: Node["type"]) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }
    setNodes([...nodes, newNode])
  }

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.shiftKey) {
      // Shift + click to create connection
      if (connectingFrom === null) {
        setConnectingFrom(nodeId)
      } else {
        setConnections([...connections, { from: connectingFrom, to: nodeId }])
        setConnectingFrom(null)
      }
    } else {
      // Regular drag
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      setDraggingNode(nodeId)
      setSelectedNode(nodeId)
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x
      const y = e.clientY - rect.top - dragOffset.y

      setNodes(nodes.map((node) => (node.id === draggingNode ? { ...node, x, y } : node)))
    }
  }

  const handleMouseUp = () => {
    setDraggingNode(null)
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
    setConnections(connections.filter((c) => c.from !== nodeId && c.to !== nodeId))
    if (selectedNode === nodeId) {
      setSelectedNode(null)
    }
  }

  const updateNodeLabel = (nodeId: string, label: string) => {
    setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, label } : node)))
  }

  const handleSave = () => {
    onSave({ nodes, connections })
  }

  const getNodeColor = (type: Node["type"]) => {
    switch (type) {
      case "start":
        return "bg-green-500"
      case "process":
        return "bg-blue-500"
      case "decision":
        return "bg-yellow-500"
      case "end":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getNodeShape = (type: Node["type"]) => {
    switch (type) {
      case "start":
      case "end":
        return "rounded-full"
      case "decision":
        return "rotate-45"
      default:
        return "rounded-lg"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => addNode("start")}>
            <Plus className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNode("process")}>
            <Plus className="h-4 w-4 mr-2" />
            Process
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNode("decision")}>
            <Plus className="h-4 w-4 mr-2" />
            Decision
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNode("end")}>
            <Plus className="h-4 w-4 mr-2" />
            End
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Flow
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 bg-secondary/10 overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full bg-white rounded-lg shadow-sm relative overflow-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ minHeight: "600px" }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((conn, idx) => {
              const fromNode = nodes.find((n) => n.id === conn.from)
              const toNode = nodes.find((n) => n.id === conn.to)
              if (!fromNode || !toNode) return null

              return (
                <line
                  key={idx}
                  x1={fromNode.x + 60}
                  y1={fromNode.y + 40}
                  x2={toNode.x + 60}
                  y2={toNode.y + 40}
                  stroke="#2563eb"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              )
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#2563eb" />
              </marker>
            </defs>
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                "absolute cursor-move select-none transition-shadow",
                selectedNode === node.id && "ring-2 ring-primary",
              )}
              style={{
                left: node.x,
                top: node.y,
                zIndex: 2,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <div
                className={cn(
                  "w-32 h-20 flex items-center justify-center text-white font-medium text-sm shadow-lg",
                  getNodeColor(node.type),
                  getNodeShape(node.type),
                  node.type === "decision" && "w-24 h-24",
                )}
              >
                <span className={cn(node.type === "decision" && "-rotate-45")}>{node.label}</span>
              </div>

              {selectedNode === node.id && (
                <div className="absolute -top-8 left-0 right-0 flex gap-1 justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNode(node.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div>
                <p className="text-muted-foreground mb-4">
                  Add nodes to start building your flow
                  <br />
                  <span className="text-sm">Hold Shift and click nodes to connect them</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {connectingFrom && (
        <div className="border-t p-4 bg-primary/10">
          <p className="text-sm text-center">
            Connecting from node... Click another node to complete the connection or press Escape to cancel
          </p>
        </div>
      )}
    </div>
  )
}
