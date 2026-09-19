import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './InfiniteCanvas.css'

type Point = { x: number; y: number }

type CanvasNode = {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

const SAMPLE_NODES: CanvasNode[] = [
  { id: '1', x: 120, y: 140, width: 220, height: 140, label: 'Welcome', color: '#4f46e5' },
  { id: '2', x: 420, y: 80, width: 200, height: 160, label: 'Ideas', color: '#0891b2' },
  { id: '3', x: 280, y: 360, width: 240, height: 130, label: 'Sketch', color: '#db2777' },
  { id: '4', x: 700, y: 280, width: 210, height: 150, label: 'Notes', color: '#ea580c' },
  { id: '5', x: -180, y: -40, width: 190, height: 120, label: 'Archive', color: '#16a34a' },
  { id: '6', x: 900, y: -100, width: 180, height: 140, label: 'Draft', color: '#7c3aed' },
]

const MIN_ZOOM = 0.15
const MAX_ZOOM = 3
const GRID_SIZE = 40

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function InfiniteCanvas() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState<Point>({ x: 80, y: 60 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  const dragStart = useRef<{ pointer: Point; offset: Point } | null>(null)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const updateSize = () => {
      setViewportSize({ width: el.clientWidth, height: el.clientHeight })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const contentBounds = useMemo(() => {
    if (SAMPLE_NODES.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const node of SAMPLE_NODES) {
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x + node.width)
      maxY = Math.max(maxY, node.y + node.height)
    }

    const pad = 200
    return {
      minX: minX - pad,
      minY: minY - pad,
      maxX: maxX + pad,
      maxY: maxY + pad,
    }
  }, [])

  const worldView = useMemo(() => {
    const { width, height } = viewportSize
    return {
      left: -offset.x / zoom,
      top: -offset.y / zoom,
      right: (-offset.x + width) / zoom,
      bottom: (-offset.y + height) / zoom,
      width: width / zoom,
      height: height / zoom,
    }
  }, [offset, zoom, viewportSize])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 && event.button !== 1) return

      const target = event.target as HTMLElement
      if (target.closest('.canvas-node')) return

      dragStart.current = {
        pointer: { x: event.clientX, y: event.clientY },
        offset: { ...offset },
      }
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [offset],
  )

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return

    const dx = event.clientX - dragStart.current.pointer.x
    const dy = event.clientY - dragStart.current.pointer.y

    setOffset({
      x: dragStart.current.offset.x + dx,
      y: dragStart.current.offset.y + dy,
    })
  }, [])

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return
    dragStart.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      const el = viewportRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const zoomFactor = event.deltaY < 0 ? 1.08 : 1 / 1.08
      setZoom((prevZoom) => {
        const nextZoom = clamp(prevZoom * zoomFactor, MIN_ZOOM, MAX_ZOOM)
        const worldX = (mouseX - offset.x) / prevZoom
        const worldY = (mouseY - offset.y) / prevZoom

        setOffset({
          x: mouseX - worldX * nextZoom,
          y: mouseY - worldY * nextZoom,
        })

        return nextZoom
      })
    },
    [offset.x, offset.y],
  )

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const gridStyle = useMemo(() => {
    const size = GRID_SIZE * zoom
    return {
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: `${offset.x % size}px ${offset.y % size}px`,
    }
  }, [offset, zoom])

  const minimap = useMemo(() => {
    const mapW = 180
    const mapH = 120
    const worldW = contentBounds.maxX - contentBounds.minX
    const worldH = contentBounds.maxY - contentBounds.minY
    const scale = Math.min(mapW / worldW, mapH / worldH)

    const contentLeft = (mapW - worldW * scale) / 2
    const contentTop = (mapH - worldH * scale) / 2

    const viewLeft =
      contentLeft + (worldView.left - contentBounds.minX) * scale
    const viewTop = contentTop + (worldView.top - contentBounds.minY) * scale
    const viewWidth = worldView.width * scale
    const viewHeight = worldView.height * scale

    return {
      mapW,
      mapH,
      scale,
      contentLeft,
      contentTop,
      viewLeft,
      viewTop,
      viewWidth,
      viewHeight,
    }
  }, [contentBounds, worldView])

  return (
    <div className="canvas-app">
      <header className="canvas-toolbar">
        <div className="toolbar-brand">
          <span className="brand-mark" />
          Infinite Canvas
        </div>
        <div className="toolbar-hint">
          Drag empty space to pan · Scroll to zoom
        </div>
        <div className="toolbar-meta">
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      </header>

      <div
        ref={viewportRef}
        className={`canvas-viewport ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="canvas-grid" style={gridStyle} />

        <div
          className="canvas-world"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
        >
          {SAMPLE_NODES.map((node) => (
            <div
              key={node.id}
              className="canvas-node"
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                borderColor: node.color,
                background: `linear-gradient(145deg, ${node.color}22, ${node.color}08)`,
              }}
            >
              <div className="node-accent" style={{ background: node.color }} />
              <div className="node-label">{node.label}</div>
              <div className="node-meta">
                {node.width} × {node.height}
              </div>
            </div>
          ))}
        </div>

        <div className={`canvas-minimap ${isDragging ? 'visible' : ''}`}>
          <div className="minimap-label">Preview</div>
          <div
            className="minimap-surface"
            style={{ width: minimap.mapW, height: minimap.mapH }}
          >
            {SAMPLE_NODES.map((node) => (
              <div
                key={node.id}
                className="minimap-node"
                style={{
                  left:
                    minimap.contentLeft +
                    (node.x - contentBounds.minX) * minimap.scale,
                  top:
                    minimap.contentTop +
                    (node.y - contentBounds.minY) * minimap.scale,
                  width: node.width * minimap.scale,
                  height: node.height * minimap.scale,
                  background: node.color,
                }}
              />
            ))}
            <div
              className="minimap-viewport"
              style={{
                left: minimap.viewLeft,
                top: minimap.viewTop,
                width: Math.max(minimap.viewWidth, 8),
                height: Math.max(minimap.viewHeight, 8),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
