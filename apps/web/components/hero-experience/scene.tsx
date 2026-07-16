import { AtmosphereField } from "./atmosphere-field";
import { EnergyCore } from "./energy-core";
import { HeroParticles } from "./hero-particles";
import { ParticleField } from "./particle-field";
import { RibbonSystem } from "./ribbon-system";

export function HeroExperienceScene() {
  return (
    <>
      <AtmosphereField />
      <ParticleField />
      <RibbonSystem />
      <EnergyCore />
      <HeroParticles />
    </>
  );
}