"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { useHeroRenderProfile } from "./hooks/use-hero-render-profile";
import { useHeroVisibility } from "./hooks/use-hero-visibility";
import { HeroExperienceScene } from "./scene";
import styles from "./hero-experience.module.css";

export function HeroExperience() {
  const { profile, reducedMotion } = useHeroRenderProfile();

  const { containerRef, isActive } = useHeroVisibility();

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null,
  );

  const [contextLost, setContextLost] = useState(false);

  const [initializationFailed, setInitializationFailed] = useState(false);

  useEffect(() => {
    if (reducedMotion || canvasElement) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setInitializationFailed(true);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [canvasElement, reducedMotion]);

  useEffect(() => {
    if (!canvasElement) {
      return;
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };

    const handleContextRestored = () => {
      setContextLost(false);
    };

    canvasElement.addEventListener("webglcontextlost", handleContextLost);

    canvasElement.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
    );

    return () => {
      canvasElement.removeEventListener("webglcontextlost", handleContextLost);

      canvasElement.removeEventListener(
        "webglcontextrestored",
        handleContextRestored,
      );
    };
  }, [canvasElement]);

  if (reducedMotion) {
    return null;
  }

  const compact = profile === "compact";
  const unavailable = contextLost || initializationFailed;

  const renderActive = isActive && !unavailable;

  return (
    <div
      ref={containerRef}
      className={styles.experience}
      data-hero-rendering={renderActive ? "active" : "paused"}
      data-hero-unavailable={unavailable ? "true" : undefined}
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 5.8],
          fov: 42,
        }}
        dpr={compact ? [1, 1.15] : [1, 1.5]}
        gl={{
          alpha: true,
          antialias: !compact,
          powerPreference: "high-performance",
        }}
        performance={{ min: 0.5 }}
        frameloop={renderActive ? "always" : "demand"}
        fallback={null}
        onCreated={({ gl }) => {
          setCanvasElement(gl.domElement);
          setInitializationFailed(false);
        }}
      >
        <HeroExperienceScene profile={profile} />
      </Canvas>
    </div>
  );
}
