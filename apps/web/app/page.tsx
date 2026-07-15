import { Navbar } from "../components/navbar";
export default function Home() {
  return (
      <>
        <Navbar />
    
        <main
          style={{
            minHeight: "100vh",
            background: "#08080a",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            fontFamily: "sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "6rem",
              margin: 0,
              letterSpacing: "-0.08em",
            }}
          >
            eMotion
          </h1>
    
          <p
            style={{
              opacity: 0.65,
              marginTop: 20,
              fontSize: "1.25rem",
            }}
          >
            Emotion becomes motion.
          </p>
        </main>
      </>    
  );
} 
