import Link from "next/link";

import { Container } from "./container";

export function Hero() {
  return (
    <section className="hero">
      <div className="heroGlow heroGlowPrimary" aria-hidden="true" />
      <div className="heroGlow heroGlowSecondary" aria-hidden="true" />
      <div className="heroGrid" aria-hidden="true" />

      <Container className="heroContainer">
        <div className="heroContent">
          <div className="heroCopy">
            <p className="heroEyebrow">
              <span aria-hidden="true" />
              Strategy · Branding · Design · Development
            </p>

            <h1 className="heroTitle">
              Emotion
              <span>becomes</span>
              <strong>motion.</strong>
            </h1>

            <p className="heroDescription">
              We create memorable brands and premium digital experiences for
              ambitious companies that want to move forward.
            </p>

            <div className="heroActions">
              <Link className="heroPrimaryAction" href="#contact">
                Start your project
                <span aria-hidden="true">↗</span>
              </Link>

              <Link className="heroSecondaryAction" href="#work">
                Explore our work
              </Link>
            </div>

            <div className="heroMeta">
              <div>
                <strong>Branding</strong>
                <span>Identity systems</span>
              </div>

              <div>
                <strong>Web design</strong>
                <span>Digital experiences</span>
              </div>

              <div>
                <strong>Development</strong>
                <span>Fast and scalable</span>
              </div>
            </div>
          </div>

          <div className="heroVisual" aria-hidden="true">
            <div className="heroVisualHalo" />

            <div className="heroOrbit heroOrbitOuter">
              <span />
            </div>

            <div className="heroOrbit heroOrbitInner">
              <span />
            </div>

            <div className="heroCore">
              <svg viewBox="0 0 64 64">
                <path
                  d="M14 14C25 18 35 24 49 32C35 40 25 46 14 50C21 42 27 36 27 32C27 28 21 22 14 14Z"
                  fill="currentColor"
                />

                <path
                  d="M19 25L35 32L19 39"
                  fill="none"
                  stroke="#08080a"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
              </svg>
            </div>

            <div className="heroCard heroCardTop">
              <small>Emotion</small>
              <strong>Ideas that connect.</strong>
            </div>

            <div className="heroCard heroCardBottom">
              <small>Motion</small>
              <strong>Design that moves.</strong>
            </div>
          </div>
        </div>

        <div className="heroScroll">
          <span>Scroll to explore</span>
          <i />
        </div>
      </Container>
    </section>
  );
}