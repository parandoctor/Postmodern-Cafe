"use client";

import * as React from "react";
import {
  Circle, Crop, Download, Eye, EyeOff, FlipHorizontal2, FlipVertical2, ImagePlus,
  Lock, Minus, Move, Redo2, RotateCw, Square, Sticker, Trash2, Type, Undo2, Unlock, Upload, X, ZoomIn, ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STICKERS = ["✦", "→", "○", "□", "×", "“”", "—", "01", "※", "△", "◌", "＋"];

type Adjustments = { brightness: number; contrast: number; saturation: number; blur: number };
type LayerInfo = { label: string; visible: boolean; locked: boolean; type: string };

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function normalizeImage(file: File): Promise<string> {
  const url = await readImage(file);
  const image = new window.Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("图片读取失败"));
    image.src = url;
  });
  const max = 4096;
  const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
  if (scale === 1) return url;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) return url;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export function ImageEditor() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const htmlCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const fabricRef = React.useRef<typeof import("fabric") | null>(null);
  const canvasRef = React.useRef<any>(null);
  const baseRef = React.useRef<any>(null);
  const cropRectRef = React.useRef<any>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const layerFileRef = React.useRef<HTMLInputElement>(null);
  const restoringRef = React.useRef(false);
  const panningRef = React.useRef(false);
  const lastPanRef = React.useRef({ x: 0, y: 0 });
  const panModeRef = React.useRef(false);
  const historyRef = React.useRef<string[]>([]);
  const historyIndexRef = React.useRef(-1);

  const [ready, setReady] = React.useState(false);
  const [layers, setLayers] = React.useState<LayerInfo[]>([]);
  const [hasImage, setHasImage] = React.useState(false);
  const [tool, setTool] = React.useState("select");
  const [panMode, setPanMode] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [adjust, setAdjust] = React.useState<Adjustments>({ brightness: 0, contrast: 0, saturation: 0, blur: 0 });
  const [format, setFormat] = React.useState<"png" | "jpeg">("png");
  const [quality, setQuality] = React.useState(0.92);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [message, setMessage] = React.useState("");

  panModeRef.current = panMode;

  const refreshLayers = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const items = canvas.getObjects().filter((object: any) => object !== cropRectRef.current);
    setLayers(items.map((object: any) => ({
      label: object.__rbLabel || (object.type === "i-text" ? "文字" : object.type === "image" ? "图片" : object.type === "rect" ? "矩形" : object.type === "ellipse" ? "椭圆" : object.type === "line" ? "线条" : "图层"),
      visible: object.visible !== false,
      locked: object.selectable === false,
      type: object.type,
    })));
  }, []);

  const pushHistory = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || restoringRef.current) return;
    const snapshot = JSON.stringify({ width: canvas.getWidth(), height: canvas.getHeight(), data: canvas.toJSON() });
    if (historyRef.current[historyIndexRef.current] === snapshot) return;
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const restore = React.useCallback(async (index: number) => {
    const canvas = canvasRef.current;
    const snapshot = historyRef.current[index];
    if (!canvas || !snapshot) return;
    restoringRef.current = true;
    const parsed = JSON.parse(snapshot) as { width: number; height: number; data: any };
    canvas.setDimensions({ width: parsed.width, height: parsed.height });
    await canvas.loadFromJSON(parsed.data);
    canvas.renderAll();
    baseRef.current = canvas.getObjects().find((object: any) => object.type === "image") ?? null;
    historyIndexRef.current = index;
    restoringRef.current = false;
    refreshLayers();
    setHasImage(Boolean(baseRef.current));
    setCanUndo(index > 0);
    setCanRedo(index < historyRef.current.length - 1);
  }, [refreshLayers]);

  React.useEffect(() => {
    let disposed = false;
    let canvas: any = null;
    void import("fabric").then((fabric) => {
      if (disposed || !htmlCanvasRef.current) return;
      fabricRef.current = fabric;
      canvas = new fabric.Canvas(htmlCanvasRef.current, {
        width: 900,
        height: 620,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
      });
      canvasRef.current = canvas;
      const changed = (event?: any) => {
        if (restoringRef.current || event?.target === cropRectRef.current) return;
        refreshLayers();
        pushHistory();
      };
      canvas.on("object:added", changed);
      canvas.on("object:removed", changed);
      canvas.on("object:modified", changed);
      canvas.on("text:changed", changed);
      const down = (event: any) => {
        if (!panModeRef.current) return;
        panningRef.current = true;
        lastPanRef.current = { x: event.e.clientX, y: event.e.clientY };
        canvas.defaultCursor = "grabbing";
      };
      const move = (event: any) => {
        if (!panningRef.current) return;
        const dx = event.e.clientX - lastPanRef.current.x;
        const dy = event.e.clientY - lastPanRef.current.y;
        lastPanRef.current = { x: event.e.clientX, y: event.e.clientY };
        canvas.relativePan(new fabric.Point(dx, dy));
      };
      const up = () => {
        if (!panningRef.current) return;
        panningRef.current = false;
        canvas.defaultCursor = "grab";
      };
      canvas.on("mouse:down", down);
      canvas.on("mouse:move", move);
      canvas.on("mouse:up", up);
      setReady(true);
      refreshLayers();
      pushHistory();
    });
    return () => {
      disposed = true;
      canvas?.dispose();
      canvasRef.current = null;
      fabricRef.current = null;
    };
  }, [pushHistory, refreshLayers]);

  React.useEffect(() => {
    if (!ready || !baseRef.current) return;
    const fabric = fabricRef.current;
    if (!fabric) return;
    const timer = window.setTimeout(() => {
      const object = baseRef.current;
      if (!object) return;
      object.filters = [
        new fabric.filters.Brightness({ brightness: adjust.brightness }),
        new fabric.filters.Contrast({ contrast: adjust.contrast }),
        new fabric.filters.Saturation({ saturation: adjust.saturation }),
        new fabric.filters.Blur({ blur: adjust.blur }),
      ];
      object.applyFilters();
      canvasRef.current?.requestRenderAll();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [adjust, ready]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.selection = !panMode;
    canvas.defaultCursor = panMode ? "grab" : "default";
    canvas.renderAll();
  }, [panMode]);

  const loadImage = async (file: File, asLayer = false) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setMessage("仅支持 JPEG、PNG、WebP 图片");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setMessage("图片不能超过 20MB");
      return;
    }
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    setMessage("");
    try {
      const dataUrl = await normalizeImage(file);
      const image = await fabric.FabricImage.fromURL(dataUrl, { crossOrigin: "anonymous" });
      image.set({ __rbLabel: asLayer ? "图片图层" : "底图" } as any);
      if (asLayer) {
        const width = Number(image.width || 1);
        const height = Number(image.height || 1);
        const scale = Math.min((canvas.getWidth() * 0.35) / width, (canvas.getHeight() * 0.35) / height, 1);
        image.scale(scale);
        image.set({ left: canvas.getWidth() / 2 - (width * scale) / 2, top: canvas.getHeight() / 2 - (height * scale) / 2 });
      } else {
        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        const width = Number(image.width || 1);
        const height = Number(image.height || 1);
        const scale = Math.min(canvas.getWidth() / width, canvas.getHeight() / height, 1);
        image.scale(scale);
        image.set({ left: (canvas.getWidth() - width * scale) / 2, top: (canvas.getHeight() - height * scale) / 2 });
        baseRef.current = image;
        setHasImage(true);
        setAdjust({ brightness: 0, contrast: 0, saturation: 0, blur: 0 });
      }
      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.renderAll();
      refreshLayers();
      pushHistory();
    } catch {
      setMessage("图片加载失败，请换一张图片重试");
    }
  };

  const addText = (value = "双击编辑文字", sticker = false) => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    const object = new fabric.IText(value, {
      left: 100, top: 100, fill: "#111", fontSize: sticker ? 64 : 32,
      fontFamily: sticker ? "Noto Sans SC" : "Noto Serif SC", objectCaching: true,
    });
    object.set({ __rbLabel: sticker ? `贴纸 ${value}` : "文字" } as any);
    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.renderAll();
    refreshLayers();
    pushHistory();
    setTool("select");
  };

  const addShape = (kind: "rect" | "ellipse" | "line") => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    const common = { left: 120, top: 120, stroke: "#111", strokeWidth: 2, fill: "transparent" } as any;
    const object = kind === "rect" ? new fabric.Rect({ ...common, width: 180, height: 120 })
      : kind === "ellipse" ? new fabric.Ellipse({ ...common, rx: 90, ry: 60 })
        : new fabric.Line([120, 120, 320, 120], { stroke: "#111", strokeWidth: 2 });
    object.set({ __rbLabel: kind === "rect" ? "矩形" : kind === "ellipse" ? "椭圆" : "线条" } as any);
    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.renderAll();
    refreshLayers();
    pushHistory();
    setTool("select");
  };

  const addCrop = () => {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;
    if (!fabric || !canvas) return;
    if (cropRectRef.current) canvas.remove(cropRectRef.current);
    const width = Math.max(120, canvas.getWidth() * 0.6);
    const height = Math.max(100, canvas.getHeight() * 0.6);
    const rect = new fabric.Rect({
      left: (canvas.getWidth() - width) / 2, top: (canvas.getHeight() - height) / 2,
      width, height, fill: "rgba(0,0,0,0.06)", stroke: "#111", strokeWidth: 1,
      strokeDashArray: [5, 4], transparentCorners: false, cornerColor: "#111",
    });
    cropRectRef.current = rect;
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setTool("crop");
    refreshLayers();
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    const rect = cropRectRef.current;
    if (!canvas || !rect) return;
    const left = Math.max(0, Math.round(rect.left));
    const top = Math.max(0, Math.round(rect.top));
    const width = Math.min(canvas.getWidth() - left, Math.round(rect.width * rect.scaleX));
    const height = Math.min(canvas.getHeight() - top, Math.round(rect.height * rect.scaleY));
    if (width < 20 || height < 20) return;
    canvas.getObjects().filter((object: any) => object !== rect).forEach((object: any) => {
      object.set({ left: object.left - left, top: object.top - top });
      object.setCoords();
    });
    canvas.setDimensions({ width, height });
    canvas.remove(rect);
    cropRectRef.current = null;
    canvas.renderAll();
    refreshLayers();
    pushHistory();
    setTool("select");
  };

  const activeObject = () => canvasRef.current?.getActiveObject();
  const rotateObject = () => {
    const object = activeObject();
    if (!object) return;
    object.rotate((object.angle || 0) + 90);
    object.setCoords();
    canvasRef.current?.renderAll();
    pushHistory();
  };
  const flipObject = (axis: "x" | "y") => {
    const object = activeObject();
    if (!object) return;
    if (axis === "x") object.set({ flipX: !object.flipX });
    else object.set({ flipY: !object.flipY });
    canvasRef.current?.renderAll();
    pushHistory();
  };

  const updateLayerVisibility = (index: number) => {
    const object = canvasRef.current?.getObjects().filter((item: any) => item !== cropRectRef.current)[index];
    if (!object) return;
    object.visible = object.visible === false;
    canvasRef.current?.renderAll();
    refreshLayers();
    pushHistory();
  };
  const updateLayerLock = (index: number) => {
    const object = canvasRef.current?.getObjects().filter((item: any) => item !== cropRectRef.current)[index];
    if (!object) return;
    object.selectable = object.selectable === false;
    object.evented = object.selectable;
    canvasRef.current?.renderAll();
    refreshLayers();
    pushHistory();
  };
  const selectLayer = (index: number) => {
    const object = canvasRef.current?.getObjects().filter((item: any) => item !== cropRectRef.current)[index];
    if (!object) return;
    canvasRef.current.setActiveObject(object);
    canvasRef.current.renderAll();
  };
  const deleteLayer = (index: number) => {
    const object = canvasRef.current?.getObjects().filter((item: any) => item !== cropRectRef.current)[index];
    if (!object) return;
    canvasRef.current.remove(object);
    if (object === baseRef.current) { baseRef.current = null; setHasImage(false); }
    refreshLayers();
    pushHistory();
  };
  const moveLayer = (index: number, direction: -1 | 1) => {
    const canvas = canvasRef.current;
    const object = canvas?.getObjects().filter((item: any) => item !== cropRectRef.current)[index];
    if (!canvas || !object) return;
    if (direction === 1) canvas.bringObjectForward(object);
    else canvas.sendObjectBackwards(object);
    canvas.renderAll();
    refreshLayers();
    pushHistory();
  };

  const updateZoom = (value: number) => {
    const next = Math.max(0.25, Math.min(3, value));
    setZoom(next);
    canvasRef.current?.setZoom(next);
    canvasRef.current?.renderAll();
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `rainbow-edit-${Date.now()}.${format === "jpeg" ? "jpg" : "png"}`;
    link.href = canvas.toDataURL({ format, quality, multiplier: 1 });
    link.click();
  };

  const clearCanvas = () => {
    if (!window.confirm("清空画布？当前编辑会被移除。")) return;
    canvasRef.current?.clear();
    canvasRef.current.backgroundColor = "#ffffff";
    canvasRef.current?.renderAll();
    baseRef.current = null;
    cropRectRef.current = null;
    setHasImage(false);
    refreshLayers();
    pushHistory();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#dedede] pb-3">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 bg-[#111] px-3 py-2 text-[11px] text-white"><Upload className="h-3.5 w-3.5" />打开图片</button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void loadImage(file); }} />
        <input ref={layerFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void loadImage(file, true); }} />
        <button onClick={() => void restore(historyIndexRef.current - 1)} disabled={!canUndo} className="p-2 text-[#666] hover:text-black disabled:opacity-30" title="撤销"><Undo2 className="h-4 w-4" /></button>
        <button onClick={() => void restore(historyIndexRef.current + 1)} disabled={!canRedo} className="p-2 text-[#666] hover:text-black disabled:opacity-30" title="重做"><Redo2 className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-[#dedede]" />
        <button onClick={rotateObject} className="p-2 text-[#666] hover:text-black" title="旋转 90°"><RotateCw className="h-4 w-4" /></button>
        <button onClick={() => flipObject("x")} className="p-2 text-[#666] hover:text-black" title="水平翻转"><FlipHorizontal2 className="h-4 w-4" /></button>
        <button onClick={() => flipObject("y")} className="p-2 text-[#666] hover:text-black" title="垂直翻转"><FlipVertical2 className="h-4 w-4" /></button>
        <button onClick={() => updateZoom(zoom - 0.1)} className="p-2 text-[#666] hover:text-black" title="缩小"><ZoomOut className="h-4 w-4" /></button>
        <span className="w-10 text-center text-[10px] tabular-nums text-[#999]">{Math.round(zoom * 100)}%</span>
        <button onClick={() => updateZoom(zoom + 0.1)} className="p-2 text-[#666] hover:text-black" title="放大"><ZoomIn className="h-4 w-4" /></button>
        <button onClick={() => setPanMode((value) => !value)} className={cn("p-2", panMode ? "text-black" : "text-[#666] hover:text-black")} title="拖动画布"><Move className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-[#dedede]" />
        <select value={format} onChange={(event) => setFormat(event.target.value as "png" | "jpeg")} className="h-8 border border-[#dedede] bg-white px-2 text-[11px]"><option value="png">PNG</option><option value="jpeg">JPEG</option></select>
        {format === "jpeg" && <input type="range" min={0.5} max={1} step={0.01} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-20 accent-black" title="JPEG 质量" />}
        <button onClick={exportImage} disabled={!hasImage} className="ml-auto flex items-center gap-1.5 border border-[#111] px-3 py-2 text-[11px] disabled:opacity-30"><Download className="h-3.5 w-3.5" />导出</button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[52px_minmax(0,1fr)_220px]">
        <div className="flex flex-row gap-1 xl:flex-col">
          {[
            { id: "select", icon: Move, label: "选择" },
            { id: "crop", icon: Crop, label: "裁剪" },
            { id: "text", icon: Type, label: "文字" },
            { id: "rect", icon: Square, label: "矩形" },
            { id: "ellipse", icon: Circle, label: "椭圆" },
            { id: "line", icon: Minus, label: "线条" },
            { id: "sticker", icon: Sticker, label: "贴纸" },
            { id: "image", icon: ImagePlus, label: "图片图层" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => {
                if (item.id === "crop") { addCrop(); return; }
                if (item.id === "text") { addText(); return; }
                if (item.id === "rect" || item.id === "ellipse" || item.id === "line") { addShape(item.id); return; }
                if (item.id === "sticker") { setTool("sticker"); return; }
                if (item.id === "image") { layerFileRef.current?.click(); return; }
                if (cropRectRef.current) { canvasRef.current?.remove(cropRectRef.current); cropRectRef.current = null; refreshLayers(); }
                setTool("select");
              }} className={cn("flex h-10 w-10 items-center justify-center border text-[#666] hover:border-black hover:text-black", tool === item.id ? "border-black text-black" : "border-transparent")} title={item.label}>
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </button>
            );
          })}
          {tool === "sticker" && (
            <div className="grid grid-cols-3 gap-1 border border-[#dedede] p-1 xl:grid-cols-2">
              {STICKERS.map((sticker) => <button key={sticker} onClick={() => addText(sticker, true)} className="flex h-8 items-center justify-center text-[15px] hover:bg-[#f5f5f5]">{sticker}</button>)}
            </div>
          )}
          {tool === "crop" && cropRectRef.current && <button onClick={applyCrop} className="bg-[#111] px-2 py-2 text-[10px] text-white">应用裁剪</button>}
        </div>

        <div ref={hostRef} className="min-w-0 overflow-auto border border-[#dedede] bg-[#f7f7f7] p-4">
          <canvas ref={htmlCanvasRef} />
          {!hasImage && ready && <div className="pointer-events-none flex min-h-[300px] items-center justify-center text-[12px] text-[#999]">打开一张图片开始编辑</div>}
        </div>

        <aside className="space-y-6">
          <section>
            <h3 className="border-b border-[#dedede] pb-2 text-[11px] tracking-[0.16em] text-[#999]">ADJUST</h3>
            <div className="mt-4 space-y-4">
              {([["brightness", "亮度", -1, 1], ["contrast", "对比度", -1, 1], ["saturation", "饱和度", -1, 1], ["blur", "模糊", 0, 1]] as const).map(([key, label, min, max]) => (
                <label key={key} className="block"><span className="mb-1 flex justify-between text-[10px] text-[#888]"><span>{label}</span><span className="tabular-nums">{adjust[key].toFixed(2)}</span></span><input type="range" min={min} max={max} step={0.01} value={adjust[key]} onChange={(event) => setAdjust((current) => ({ ...current, [key]: Number(event.target.value) }))} className="w-full accent-black" disabled={!hasImage} /></label>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between border-b border-[#dedede] pb-2"><h3 className="text-[11px] tracking-[0.16em] text-[#999]">LAYERS</h3><span className="text-[10px] text-[#aaa]">{layers.length}</span></div>
            <div className="mt-2 max-h-[280px] overflow-y-auto">
              {layers.length === 0 ? <p className="py-4 text-[11px] text-[#aaa]">还没有图层。</p> : layers.map((layer, index) => (
                <div key={`${layer.label}-${index}`} className="group flex items-center gap-1 border-b border-[#f0f0f0] py-1.5">
                  <button onClick={() => selectLayer(index)} className="min-w-0 flex-1 truncate text-left text-[11px] text-[#555] hover:text-black">{layer.label}</button>
                  <button onClick={() => updateLayerVisibility(index)} className="p-1 text-[#999] hover:text-black" title="显示/隐藏">{layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}</button>
                  <button onClick={() => updateLayerLock(index)} className="p-1 text-[#999] hover:text-black" title="锁定/解锁">{layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}</button>
                  <button onClick={() => moveLayer(index, 1)} className="p-1 text-[#999] hover:text-black" title="上移">↑</button>
                  <button onClick={() => moveLayer(index, -1)} className="p-1 text-[#999] hover:text-black" title="下移">↓</button>
                  <button onClick={() => deleteLayer(index)} className="p-1 text-[#999] hover:text-black" title="删除"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <button onClick={clearCanvas} className="mt-3 flex items-center gap-1.5 text-[10px] text-[#999] hover:text-black"><X className="h-3 w-3" />清空画布</button>
          </section>
        </aside>
      </div>
      {message && <p className="text-[11px] text-[#777]">{message}</p>}
      <div className="border-t border-[#ededed] pt-3 text-[10px] text-[#aaa]">支持 JPEG / PNG / WebP，最大 20MB。编辑结果只下载到本地。</div>
    </div>
  );
}
