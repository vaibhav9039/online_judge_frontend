import React, { useRef, useState, useEffect } from 'react';

const COLORS = [
  '#000000', '#FFFFFF', '#808080', '#C0C0C0',
  '#800000', '#FF0000', '#808000', '#FFFF00',
  '#008000', '#00FF00', '#008080', '#00FFFF',
  '#000080', '#0000FF', '#800080', '#FF00FF',
];

const BRUSH_SIZES = [2, 4, 8, 12, 20];

type Tool = 'brush' | 'eraser' | 'fill' | 'line' | 'rect' | 'ellipse';

export function PaintWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<Tool>('brush');
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [canvasSnapshot, setCanvasSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setStartPos({ x, y });

    if (tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (tool === 'fill') {
      floodFill(x, y, color);
      setIsDrawing(false);
    } else {
      // Save canvas state for shape tools
      setCanvasSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (startPos && canvasSnapshot) {
      // Restore canvas and draw shape preview
      ctx.putImageData(canvasSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = brushSize;

      switch (tool) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          break;
        case 'rect':
          ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
          break;
        case 'ellipse':
          ctx.beginPath();
          const rx = Math.abs(x - startPos.x) / 2;
          const ry = Math.abs(y - startPos.y) / 2;
          const cx = startPos.x + (x - startPos.x) / 2;
          const cy = startPos.y + (y - startPos.y) / 2;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
    setCanvasSnapshot(null);
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startIdx = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];

    // Parse fill color
    const hex = fillColor.replace('#', '');
    const fillR = parseInt(hex.substr(0, 2), 16);
    const fillG = parseInt(hex.substr(2, 2), 16);
    const fillB = parseInt(hex.substr(4, 2), 16);

    if (startColor[0] === fillR && startColor[1] === fillG && startColor[2] === fillB) return;

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      visited.add(key);

      const idx = (y * canvas.width + x) * 4;
      if (
        data[idx] !== startColor[0] ||
        data[idx + 1] !== startColor[1] ||
        data[idx + 2] !== startColor[2]
      ) continue;

      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'painting.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="xp-panel p-1 flex items-center gap-2 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          {[
            { id: 'brush', icon: '✏️', label: 'Brush' },
            { id: 'eraser', icon: '🧹', label: 'Eraser' },
            { id: 'fill', icon: '🪣', label: 'Fill' },
            { id: 'line', icon: '📏', label: 'Line' },
            { id: 'rect', icon: '⬜', label: 'Rectangle' },
            { id: 'ellipse', icon: '⭕', label: 'Ellipse' },
          ].map((t) => (
            <button
              key={t.id}
              className={`xp-button p-1 text-sm ${tool === t.id ? 'xp-button-pressed' : ''}`}
              onClick={() => setTool(t.id as Tool)}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <span className="text-xs">Size:</span>
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              className={`xp-button p-1 w-6 h-6 flex items-center justify-center ${brushSize === size ? 'xp-button-pressed' : ''}`}
              onClick={() => setBrushSize(size)}
            >
              <div
                className="rounded-full bg-black"
                style={{ width: Math.min(size, 12), height: Math.min(size, 12) }}
              />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="xp-button text-xs px-2" onClick={clearCanvas}>
            🗑️ Clear
          </button>
          <button className="xp-button text-xs px-2" onClick={saveImage}>
            💾 Save
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex min-h-0">
        {/* Color Palette */}
        <div className="xp-panel p-1 flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-0.5">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`w-5 h-5 border ${color === c ? 'border-2 border-black' : 'border-gray-400'}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="mt-2">
            <div className="text-xs text-center mb-1">Current</div>
            <div
              className="w-10 h-10 border-2 border-gray-400 mx-auto"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 xp-panel-inset overflow-auto p-1">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="bg-white cursor-crosshair border border-gray-300"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="xp-panel p-1 text-xs flex items-center gap-4">
        <span>Tool: {tool}</span>
        <span>Color: {color}</span>
        <span>Size: {brushSize}px</span>
      </div>
    </div>
  );
}
