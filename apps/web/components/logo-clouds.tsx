const brands = [
    "Google",
    "Microsoft",
    "Airbnb",
    "Spotify",
    "Adobe",
    "Netflix",
    "Stripe",
    "Apple",
  ];
  
  export function LogoCloud() {
    return (
      <section className="logoCloud" aria-label="Selected client brands">
        <div className="logoCloudTrack">
          {[...brands, ...brands].map((brand, index) => (
            <span key={`${brand}-${index}`}>{brand}</span>
          ))}
        </div>
      </section>
    );
  }