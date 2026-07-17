import { AtmosphereField } from "./atmosphere-field";
import { EnergyCore } from "./energy-core";
import { HeroParticles } from "./hero-particles";
import { LogoFormation } from "./logo-formation";
import { ParticleField } from "./particle-field";
import { RibbonSystem } from "./ribbon-system";
import type { HeroRenderProfile } from "./hooks/use-hero-render-profile";

type HeroExperienceSceneProps = {
  profile: HeroRenderProfile;
};

export function HeroExperienceScene({ profile }: HeroExperienceSceneProps) {
  const compact = profile === "compact";

  return (
    <>
      <AtmosphereField compact={compact} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <group position={compact ? [0.2, 0.32, 0] : [0.58, 0.2, 0]}>
        <ParticleField compact={compact} />
        <RibbonSystem compact={compact} />
        <EnergyCore compact={compact} />
        <LogoFormation compact={compact} />
        <HeroParticles />
      </group>
    </>
  );
}
