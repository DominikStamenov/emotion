import { EnergyCore } from "./energy-core";
import { ParticleField } from "./particle-field";
import { RibbonSystem } from "./ribbon-system";

export function HeroExperienceScene() {
  return (
    <>
      <ParticleField />
      <RibbonSystem />
      <EnergyCore />
    </>
  );
}