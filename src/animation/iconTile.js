import React from "react";
import * as THREE from "three";

/**
 * Paints a react-icons glyph onto a square texture, so a tech icon can be
 * mapped onto the faces of a 3D block.
 *
 * Calling one of these icon components returns a React element that already
 * carries the viewBox and the raw <path> nodes, so the markup can be rebuilt by
 * hand. That keeps react-dom/server, which is the usual way to reach for this,
 * out of the bundle for the sake of a handful of icons.
 */

const TILE = 100; // the face is laid out on a 100 unit square
const GLYPH = 58; // how much of that square the icon itself takes up

const dashed = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const serialize = (nodes) =>
  React.Children.toArray(nodes)
    .map((node) => {
      if (typeof node !== "object" || typeof node.type !== "string") return "";

      const { children, ...rest } = node.props ?? {};
      const attrs = Object.entries(rest)
        .filter(([, value]) => value != null && typeof value !== "object" && typeof value !== "function")
        .map(([key, value]) => `${dashed(key)}="${String(value).replace(/"/g, "&quot;")}"`)
        .join(" ");

      return `<${node.type} ${attrs}>${serialize(children)}</${node.type}>`;
    })
    .join("");

// Textures are shared: the same icon on the same colour is only drawn once.
const cache = new Map();

/**
 * @param {Function} Icon  a react-icons component
 * @param {string} face    the background colour of the tile
 * @param {string} ink     the colour of the glyph itself
 */
export const iconTile = (Icon, face, ink = "#16232f") => {
  let shades = cache.get(Icon);
  if (!shades) cache.set(Icon, (shades = new Map()));

  const held = shades.get(face);
  if (held) return held;

  const { attr, children } = Icon({}).props;
  const [x0, y0, w, h] = String(attr?.viewBox ?? "0 0 24 24")
    .trim()
    .split(/\s+/)
    .map(Number);

  // Icons are drawn on all sorts of viewBoxes, so fit the longest side to the
  // glyph box and centre whatever is left over.
  const scale = GLYPH / Math.max(w, h);
  const x = (TILE - w * scale) / 2 - x0 * scale;
  const y = (TILE - h * scale) / 2 - y0 * scale;

  // The width and height matter: an SVG without an intrinsic size is rasterised
  // at the browser's default when it goes through an <img>.
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 ${TILE} ${TILE}">`,
    `<rect width="${TILE}" height="${TILE}" fill="${face}"/>`,
    `<rect x="4" y="4" width="${TILE - 8}" height="${TILE - 8}" fill="none" stroke="${ink}" stroke-opacity="0.22" stroke-width="2"/>`,
    `<g transform="translate(${x} ${y}) scale(${scale})" fill="${ink}">${serialize(children)}</g>`,
    "</svg>",
  ].join("");

  const texture = new THREE.TextureLoader().load(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  shades.set(face, texture);
  return texture;
};
