import { AtmosphereField } from "./atmosphere-field";
import { EnergyCore } from "./energy-core";
import { HeroParticles } from "./hero-particles";
import { LogoFormation } from "./logo-formation";
import { ParticleField } from "./particle-field";
import { RibbonSystem } from "./ribbon-system";

export function HeroExperienceScene() {
  return (
    <>
      <AtmosphereField />
      <ParticleField />
      <RibbonSystem />
      <EnergyCore />
      <LogoFormation />
      <HeroParticles />
    </>
  );
}