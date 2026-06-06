"use client";

import JsBarcode from "jsbarcode";

export function generateBarcode(
  value: string,
  options?: {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
  }
): string {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: options?.format ?? "CODE128",
    width: options?.width ?? 2,
    height: options?.height ?? 80,
    displayValue: options?.displayValue ?? true,
    fontSize: 14,
    margin: 10,
    background: "#ffffff",
    lineColor: "#1e1b4b",
  });
  return canvas.toDataURL("image/png");
}

export function generateBarcodeSvg(value: string): string {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, value, {
    format: "CODE128",
    width: 2,
    height: 60,
    displayValue: true,
  });
  return new XMLSerializer().serializeToString(svg);
}
