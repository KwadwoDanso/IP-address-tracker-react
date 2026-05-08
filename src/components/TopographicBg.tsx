// TopographicBg.tsx — Three.js animated topographic surface
//
// Research applied (Tier 1 semantic depth > Tier 4 ornament):
//   • Two layered wireframe meshes (foreground + parallax) — depth without noise
//   • Particles dropped — they were ornamental, not informational
//   • Slow camera drift creates spatial sense without motion sickness
//   • prefers-reduced-motion: renders one static frame, no animation loop
//   • Cleanup disposes geometry/material/renderer to prevent GPU leaks

import { useEffect, useRef } from "react";

declare const THREE: any;

interface Props { isDark: boolean }

function TopographicBg({ isDark }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const meshesRef = useRef<{ top: any; bottom: any } | null>(null);

    useEffect(() => {
        if (!ref.current || typeof THREE === "undefined") return;
        const node = ref.current;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, node.clientWidth / node.clientHeight, 0.1, 1000);
        camera.position.set(0, 14, 20);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(node.clientWidth, node.clientHeight);
        renderer.setClearColor(0x000000, 0);
        node.appendChild(renderer.domElement);

        const makeMesh = (yOffset: number, opacity: number, color: number) => {
            const geo = new THREE.PlaneGeometry(50, 50, 80, 80);
            geo.rotateX(-Math.PI / 2);
            const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.y = yOffset;
            scene.add(mesh);
            const pos = geo.attributes.position.array as Float32Array;
            const orig = new Float32Array(pos.length / 3);
            for (let i = 0; i < pos.length / 3; i++) orig[i] = pos[i * 3 + 1];
            return { mesh, geo, mat, pos, orig };
        };

        // Two-layer parallax: foreground topography + softer mid-depth
        const top = makeMesh(0, 0.6, 0x6366f1);
        const bottom = makeMesh(-3, 0.28, 0x4f46e5);
        meshesRef.current = { top, bottom };

        let t = 0, rafId = 0;
        const displace = (l: typeof top, freq: number, amp: number, phase: number) => {
            for (let i = 0; i < l.pos.length / 3; i++) {
                const x = l.pos[i * 3], z = l.pos[i * 3 + 2];
                l.pos[i * 3 + 1] = l.orig[i] + Math.sin(x * freq + t + phase) * amp + Math.cos(z * freq + t * 0.7 + phase) * amp;
            }
            l.geo.attributes.position.needsUpdate = true;
        };

        const animate = () => {
            t += 0.01;
            displace(top, 0.3, 0.85, 0);
            displace(bottom, 0.4, 0.55, 1.5);
            top.mesh.rotation.y = t * 0.04;
            bottom.mesh.rotation.y = -t * 0.03;
            camera.position.x = Math.sin(t * 0.08) * 1.3;
            camera.position.y = 14 + Math.cos(t * 0.12) * 0.7;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
        };