import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { Modal } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { Link } from "react-router-dom";
import editorialHero from "../assets/jeju-editorial-hero.png";
import haenyeoImage from "../assets/jeju-haenyeo.png";
import seongsanImage from "../assets/jeju-seongsan.png";
import { getDestinations } from "../api";
import type { Destination as ApiDestination } from "../types";

type Destination = {
    title: string;
    area: string;
    note: string;
    image: string;
    position?: string;
};

const fallbackDestinations: Destination[] = [
    {
        title: "Seongsan",
        area: "East Jeju",
        note: "Sunrise over a volcanic crater",
        image: seongsanImage,
    },
    {
        title: "Haenyeo Coast",
        area: "Seogwipo",
        note: "Living heritage by the sea",
        image: haenyeoImage,
    },
    {
        title: "Woljeongri",
        area: "North-east Jeju",
        note: "Blue water and a slower rhythm",
        image: editorialHero,
        position: "65% center",
    },
    {
        title: "Silver Grass",
        area: "Jeju Oreum",
        note: "Fields in the windy season",
        image: seongsanImage,
        position: "center bottom",
    },
    {
        title: "Volcanic Shore",
        area: "South Jeju",
        note: "Black-rock paths meeting the ocean",
        image: editorialHero,
        position: "20% center",
    },
];

const offers = [
    {
        eyebrow: "CULTURE EDIT",
        title: "haenyeo",
        subtitle: "Living heritage",
        image: haenyeoImage,
    },
    {
        eyebrow: "SLOW JOURNEY",
        title: "seongsan",
        subtitle: "Sunrise route",
        image: seongsanImage,
    },
    {
        eyebrow: "COASTAL ESCAPE",
        title: "jeju coast",
        subtitle: "Three quiet days",
        image: editorialHero,
    },
];

export default function PublicDiscoverSections() {
    const [preview, setPreview] = useState<Destination | null>(null);
    const [destinations, setDestinations] =
        useState<Destination[]>(fallbackDestinations);
    useEffect(() => {
        void getDestinations(true)
            .then(({ items }) =>
                setDestinations(
                    items.map((item: ApiDestination) => ({
                        title: item.name,
                        area: item.region,
                        note: item.description,
                        image:
                            item.image_key === "seongsan"
                                ? seongsanImage
                                : item.image_key.includes("folk")
                                  ? haenyeoImage
                                  : editorialHero,
                    })),
                ),
            )
            .catch(() => undefined);
    }, []);
    return (
        <>
            <section className="popular-section">
                <header className="showcase-heading">
                    <span>DRAG TO EXPLORE · 01</span>
                    <h2>
                        Popular
                        <br />
                        <em>destinations.</em>
                    </h2>
                    <p>
                        Swipe through a curated collection of Jeju highlights.
                    </p>
                </header>
                <Carousel
                    className="destination-carousel"
                    slideSize={{ base: "82%", sm: "46%", lg: "28%" }}
                    slideGap={{ base: 14, md: 22 }}
                    emblaOptions={{
                        loop: true,
                        dragFree: true,
                        align: "center",
                    }}
                    withIndicators
                    nextControlIcon={<ArrowRight size={17} />}
                    previousControlIcon={<ArrowLeft size={17} />}
                >
                    {destinations.map((item) => (
                        <Carousel.Slide key={item.title}>
                            <button
                                className="destination-card"
                                onClick={() => setPreview(item)}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{ objectPosition: item.position }}
                                />
                                <span className="card-index">
                                    {String(
                                        destinations.indexOf(item) + 1,
                                    ).padStart(2, "0")}
                                </span>
                                <div>
                                    <small>
                                        <MapPin size={12} /> {item.area}
                                    </small>
                                    <h3>{item.title}</h3>
                                    <p>{item.note}</p>
                                </div>
                            </button>
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </section>

            <section className="offer-section">
                <header className="showcase-heading centered">
                    <span>CURATED FOR YOU · 02</span>
                    <h2>
                        Exclusive <em>edits.</em>
                    </h2>
                    <p>
                        Starter journeys you can personalize with Taewak.
                    </p>
                </header>
                <div className="offer-grid">
                    {offers.map((item) => (
                        <article key={item.title}>
                            <img src={item.image} alt={item.title} />
                            <div>
                                <small>{item.eyebrow}</small>
                                <h3>{item.title}</h3>
                                <p>{item.subtitle}</p>
                                <Link to="/lich-trinh">
                                    Explore route <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <Modal
                opened={Boolean(preview)}
                onClose={() => setPreview(null)}
                size="xl"
                centered
                padding={0}
                radius={24}
                withCloseButton={false}
                overlayProps={{ backgroundOpacity: 0.55, blur: 8 }}
            >
                {preview && (
                    <div className="destination-preview">
                        <div>
                            <img
                                src={preview.image}
                                alt={preview.title}
                                style={{ objectPosition: preview.position }}
                            />
                        </div>
                        <section>
                            <button
                                onClick={() => setPreview(null)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <span>{preview.area}</span>
                            <h2>{preview.title}</h2>
                            <p>
                                {preview.note}. Open a personal itinerary and let
                                Taewak arrange the timing, route, and experiences
                                around you.
                            </p>
                            <Link to="/lich-trinh">
                                Plan this trip <ArrowUpRight size={16} />
                            </Link>
                        </section>
                    </div>
                )}
            </Modal>
        </>
    );
}
