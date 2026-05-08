// AboutPage.tsx — feature cards explaining the tech stack and design decisions

const SECTIONS = [
    { title: "Geolocation", body: "Geo.ipify converts an IP address or domain into city-level coordinates, timezone, and ISP information." },
    { title: "Interactive Map", body: "Leaflet renders the location. Light mode uses OpenStreetMap; dark mode swaps to CartoDB Dark Matter for a low-strain night look." },
    { title: "Track Path", body: "Every IP you have searched is connected by a dotted blue line on the map — your search history visualised geographically." },
    { title: "Theme System", body: "Three independent gradient sliders for theme mode (white-to-black), color inversion percentage, and a night mode blue light filter." },
    { title: "3D Topographic Hero", body: "Two layered WebGL wireframe surfaces with slow camera drift. Restrained per research: depth that supports the page, not theatrics." },
    { title: "Neumorphic UI", body: "Container neumorphism (research-backed). Soft tactile shells; controls stay explicit and high-contrast for accessibility." },
];

function AboutPage() {
    return (
        <main id="main-content" className="page" role="main" aria-label="About this application">
            <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>About this app</h1>
            <p className="page-subtitle" style={{ fontSize: "1rem", marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
                An interactive IP tracking tool that visualises networks geographically, with a focus on accessibility, smooth animations, and granular display preferences.
            </p>

            <div className="about-grid">
                {SECTIONS.map((s) => (
                    <article key={s.title} className="about-card">
                        <h2>{s.title}</h2>
                        <p>{s.body}</p>
                    </article>
                ))}
            </div>

            <section className="about-card" aria-label="Built with" style={{ marginTop: "2rem" }}>
                <h2>Built with</h2>
                <p>React 19 · TypeScript · Vite · Three.js · GSAP · LeafletJS · OpenStreetMap · CartoDB Dark Matter · Geo.ipify API</p>
            </section>
        </main>
    );
}

export default AboutPage;