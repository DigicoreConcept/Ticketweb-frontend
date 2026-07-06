"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";

const FIELD_KEYS = [
  { key: "qr_code", label: "QR Code" },
  { key: "attendee_name", label: "Attendee Name" },
  { key: "event_title", label: "Event Title" },
  { key: "event_date", label: "Event Date" },
  { key: "seat_number", label: "Seat Number" },
  { key: "table_number", label: "Table Number" },
];

export function TemplateEditor({ 
  imageUrl, 
  onSave, 
  loading 
}: { 
  imageUrl: string; 
  onSave: (schema: any[]) => void;
  loading: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    });
    setCanvas(fabricCanvas);

    fabric.Image.fromURL(imageUrl, (img) => {
      // scale image to fit a fixed editor width, keep the scale factor
      const scale = 800 / (img.width || 800);
      img.scale(scale);
      fabricCanvas.setWidth(800);
      fabricCanvas.setHeight((img.height || 600) * scale);
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
    }, { crossOrigin: 'anonymous' });

    return () => {
      fabricCanvas.dispose();
    };
  }, [imageUrl]);

  const addField = (key: string, label: string) => {
    if (!canvas) return;

    if (key === "qr_code") {
      const rect = new fabric.Rect({
        left: 50, top: 50, width: 100, height: 100,
        fill: "rgba(0,0,0,0.5)", stroke: "black", strokeWidth: 2,
        cornerColor: "blue",
      });
      // Need a way to identify it later
      (rect as any).field_key = key;
      canvas.add(rect);
    } else {
      const text = new fabric.Text(`[${label}]`, {
        left: 50, top: 50,
        fontSize: 24,
        fontFamily: "Inter",
        fill: "#000000",
        cornerColor: "blue",
      });
      (text as any).field_key = key;
      canvas.add(text);
    }
  };

  const saveSchema = () => {
    if (!canvas) return;
    const W = canvas.getWidth(), H = canvas.getHeight();
    const schema = canvas.getObjects().map((obj: any) => {
      const isText = obj.type === "text";
      return {
        field_key: obj.field_key,
        x_pct: obj.left! / W,
        y_pct: obj.top! / H,
        w_pct: (obj.width! * obj.scaleX!) / W,
        h_pct: (obj.height! * obj.scaleY!) / H,
        font_size_pct: isText ? (obj.fontSize! * obj.scaleY!) / H : undefined,
        color: isText ? obj.fill : undefined,
      };
    });
    onSave(schema);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {FIELD_KEYS.map((f) => (
          <Button 
            key={f.key} 
            variant="outline"
            onClick={() => addField(f.key, f.label)}
          >
            + {f.label}
          </Button>
        ))}
        <div className="flex-1" />
        <Button onClick={saveSchema} disabled={loading} className="bg-primary text-black">
          {loading ? "Saving..." : "Save Layout"}
        </Button>
      </div>
      
      <div className="border border-white/20 rounded-xl overflow-hidden bg-white/5 w-fit">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
