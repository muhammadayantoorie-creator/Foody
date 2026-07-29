import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Food3DHeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xe23744, 4, 50); // Primary Red Glow
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b35, 3, 50); // Orange Glow
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x7c3aed, 3, 50); // Purple Ambient Glow
    pointLight3.position.set(0, 15, -5);
    scene.add(pointLight3);

    // 3D Food Meshes
    const meshes = [];
    const geometries = [
      new THREE.TorusGeometry(2, 0.6, 16, 100), // Donut / Pizza Crust shape
      new THREE.IcosahedronGeometry(1.6, 1),    // Gem / Truffle shape
      new THREE.OctahedronGeometry(1.4, 0),     // Spice Crystal
      new THREE.DodecahedronGeometry(1.5, 0),   // Gourmet Burger bun representation
      new THREE.SphereGeometry(1.2, 32, 32),    // Gourmet Berry
    ];

    const colors = [0xe23744, 0xff6b35, 0xf5a623, 0x1ba672, 0x7c3aed];

    geometries.forEach((geo, i) => {
      const material = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.2,
        metalness: 0.4,
        wireframe: i === 1 || i === 3, // Metallic wireframe futuristic 3D aesthetic
      });

      const mesh = new THREE.Mesh(geo, material);
      
      // Initial positions in 3D space
      const angle = (i / geometries.length) * Math.PI * 2;
      const radius = 9 + Math.random() * 2;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = Math.sin(angle) * (radius * 0.5);
      mesh.position.z = (Math.random() - 0.5) * 6;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      scene.add(mesh);
      meshes.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        floatSpeed: 0.002 + Math.random() * 0.002,
        floatOffset: Math.random() * Math.PI * 2,
      });
    });

    // Orbiting 3D Particle System (Stars/Sparkles)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45;
      positions[i + 1] = (Math.random() - 0.5) * 25;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Tracking Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / container.clientWidth - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / container.clientHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera lerp on mouse move
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX * 3;
      camera.position.y = -targetY * 2;
      camera.lookAt(scene.position);

      // Rotate meshes
      meshes.forEach(({ mesh, rotSpeedX, rotSpeedY, floatSpeed, floatOffset }) => {
        mesh.rotation.x += rotSpeedX;
        mesh.rotation.y += rotSpeedY;
        mesh.position.y += Math.sin(elapsedTime * 2 + floatOffset) * floatSpeed;
      });

      // Slowly rotate particle system
      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    />
  );
}
