import { useEffect } from "react";
import {
    ArrowDownRight,
    Compass,
    MessageCircleMore,
    Route,
    Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import EditorialLayout from "../components/EditorialLayout";
import editorialHero from "../assets/jeju-editorial-hero.png";
import haenyeoImage from "../assets/jeju-haenyeo.png";
import seongsanImage from "../assets/jeju-seongsan.png";
import PublicDiscoverSections from "../components/PublicDiscoverSections";

export default function HomePage() {
    useEffect(() => {
        const nodes = document.querySelectorAll(".reveal-up");
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                }),
            { threshold: 0.12 },
        );
        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, []);
    return (
        <EditorialLayout>
            <main>
                <section className="hero editorial-hero">
                    <div className="hero-copy reveal-up">
                        <div className="eyebrow">
                            <Sparkles size={14} /> CURATED BY TAEWAK · 2026
                        </div>
                        <h1>
                            JEJU
                            <br />
                            <em>slowly.</em>
                        </h1>
                        <div className="hero-intro">
                            <p>
                                A journey curated for you — through Jeju’s
                                nature, culture, and quiet moments.
                            </p>
                            <Link to="/lich-trinh">
                                Design your itinerary <ArrowDownRight size={17} />
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual reveal-up">
                        <div className="image-frame">
                            <img
                                src={editorialHero}
                                alt="Jeju volcanic coast"
                            />
                        </div>
                        <div className="floating-badge">
                            <strong>01</strong>
                            <span>CURATED JOURNEY</span>
                        </div>
                        <span className="vertical-caption">
                            33.4996° N · 126.5312° E
                        </span>
                    </div>
                </section>
                <section className="editorial-services reveal-up">
                    <div className="section-kicker">WHAT WE CURATE</div>
                    <h2>
                        Jeju Island,
                        <br />
                        at <em>your pace.</em>
                    </h2>
                    <div className="service-grid">
                        <Link to="/kham-pha">
                            <Compass />
                            <span>01</span>
                            <h3>DISCOVER</h3>
                            <p>
                                Destinations selected for your interests,
                                season, and travel style.
                            </p>
                        </Link>
                        <Link to="/lich-trinh">
                            <Route />
                            <span>02</span>
                            <h3>ITINERARY</h3>
                            <p>
                                Each day balances movement, experiences, and
                                time to rest.
                            </p>
                        </Link>
                        <Link to="/lich-trinh">
                            <MessageCircleMore />
                            <span>03</span>
                            <h3>COMPANION</h3>
                            <p>
                                Taewak listens and adapts your journey through
                                conversation.
                            </p>
                        </Link>
                    </div>
                </section>
                <PublicDiscoverSections />
                <section className="editorial-gallery reveal-up">
                    <header>
                        <span>THE ISLAND EDIT</span>
                        <h2>
                            Stories from
                            <br />
                            <em>the coast.</em>
                        </h2>
                    </header>
                    <div className="portfolio-grid">
                        <article>
                            <Link className="portfolio-image" to="/van-hoa">
                                <img
                                    src={haenyeoImage}
                                    alt="Haenyeo woman diver"
                                />
                                <span>VIEW STORY</span>
                            </Link>
                            <small>LIVING HERITAGE · PORTRAIT</small>
                            <h3>
                                Haenyeo,
                                <br />
                                women of the sea.
                            </h3>
                        </article>
                        <article>
                            <Link className="portfolio-image" to="/kham-pha">
                                <img
                                    src={seongsanImage}
                                    alt="Seongsan Ilchulbong"
                                />
                                <span>VIEW PLACE</span>
                            </Link>
                            <small>LANDSCAPE · EAST JEJU</small>
                            <h3>
                                Where the island
                                <br />
                                meets the light.
                            </h3>
                        </article>
                    </div>
                </section>
            </main>
        </EditorialLayout>
    );
}
