import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated, config } from '@react-spring/three';
import { Plane, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';
import type { Artwork } from '../../types/supabase';

interface Frame {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  imageUrl?: string;
  title?: string;
  price?: number;
  currency?: string;
  index: number;
}

const framePositions: Omit<Frame, 'index' | 'imageUrl' | 'title' | 'price' | 'currency'>[] = [
  { position: [-2, 1, 0], rotation: [0, 0.2, 0.1], scale: 1.2 },
  { position: [2, -0.8, 0], rotation: [-0.1, -0.2, -0.05], scale: 1.1 },
  { position: [-1.5, -1.5, -0.3], rotation: [0.1, 0.2, -0.1], scale: 0.9 },
  { position: [1.5, 1.5, -0.2], rotation: [-0.1, -0.1, 0.05], scale: 1.2 },
  { position: [0, 0.3, 0.2], rotation: [0, 0, 0], scale: 1.0 },
];

const AnimatedPlane = animated(Plane);
const AnimatedText = animated(Text);

// Default placeholder image when loading fails
const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxNDIxM0QiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0Ij5BcnR3b3JrPC90ZXh0Pjwvc3ZnPg==';

function Frame({ position, rotation, scale, imageUrl, title, price, currency, index }: Frame) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [textureUrl, setTextureUrl] = useState(imageUrl || DEFAULT_IMAGE);
  const texture = useTexture(textureUrl);

  // Handle texture loading error
  useEffect(() => {
    const handleError = () => {
      setTextureUrl(DEFAULT_IMAGE);
    };

    texture.image?.addEventListener('error', handleError);
    return () => {
      texture.image?.removeEventListener('error', handleError);
    };
  }, [texture]);

  const { hoverScale, hoverRotation, textOpacity } = useSpring({
    hoverScale: hovered ? [scale * 1.1, scale * 1.1, scale * 1.1] : [scale, scale, scale],
    hoverRotation: hovered ? [rotation[0], rotation[1] + 0.2, rotation[2]] : rotation,
    textOpacity: hovered ? 1 : 0,
    config: config.wobbly,
  });

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + index) * 0.05;
      meshRef.current.rotation.z = rotation[2] + Math.sin(time * 0.3 + index) * 0.03;
    }
  });

  const TextWithBackground = ({ text, position, fontSize, color }: any) => (
    <group position={position}>
      <Plane args={[1.8, 0.25]} position={[0, 0, -0.01]}>
        <meshBasicMaterial color="#000000" transparent opacity={0.8} />
      </Plane>
      <AnimatedText
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        opacity={textOpacity}
      >
        {text}
      </AnimatedText>
    </group>
  );

  return (
    <group position={position}>
      <AnimatedPlane
        ref={meshRef}
        args={[1, 1.5]}
        rotation={hoverRotation}
        scale={hoverScale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          map={texture}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </AnimatedPlane>

      <TextWithBackground
        text={title || 'Artwork'}
        position={[0, -0.6, 0.1]}
        fontSize={0.08}
        color="#ffffff"
      />

      <TextWithBackground
        text={price ? `${price} ${currency}` : 'Price on request'}
        position={[0, -0.8, 0.1]}
        fontSize={0.06}
        color="#FCA311"
      />
    </group>
  );
}

export function FloatingFrames() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const initializeFrames = async () => {
      try {
        const connected = await checkSupabaseConnection();
        setIsConnected(connected);
        
        if (connected) {
          await fetchArtworks();
        } else {
          setPlaceholderFrames();
        }
      } catch (error) {
        console.error('Error initializing frames:', error);
        setPlaceholderFrames();
      }
    };

    initializeFrames();
  }, []);

  const setPlaceholderFrames = () => {
    const placeholderFrames = framePositions.map((frame, index) => ({
      ...frame,
      imageUrl: DEFAULT_IMAGE,
      title: 'Artwork',
      price: 0,
      currency: 'ETH',
      index,
    }));
    setFrames(placeholderFrames);
  };

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .limit(framePositions.length);
      
      if (error) throw error;
      
      if (data) {
        const newFrames = framePositions.map((frame, index) => ({
          ...frame,
          imageUrl: data[index]?.media_url || DEFAULT_IMAGE,
          title: data[index]?.title || 'Artwork',
          price: data[index]?.price || 0,
          currency: data[index]?.currency || 'ETH',
          index,
        }));
        setFrames(newFrames);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setPlaceholderFrames();
    }
  };

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
      groupRef.current.position.y = Math.sin(time * 0.3) * 0.05;
      
      const breathingScale = 1 + Math.sin(time * 0.5) * 0.01;
      groupRef.current.scale.set(breathingScale, breathingScale, breathingScale);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1} />
      <spotLight
        position={[0, 5, 5]}
        angle={0.5}
        penumbra={0.5}
        intensity={1}
        castShadow
      />
      <spotLight
        position={[-5, 0, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.8}
        castShadow
      />
      <spotLight
        position={[5, 0, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.8}
        castShadow
      />
      
      {frames.map((frame) => (
        <Frame key={frame.index} {...frame} />
      ))}
    </group>
  );
}