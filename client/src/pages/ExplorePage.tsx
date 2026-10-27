import { ArrowUpRight, ExternalLink, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Skeleton } from "@mantine/core";
import { Link } from "react-router-dom";
import EditorialLayout from "../components/EditorialLayout";
import editorialHero from "../assets/jeju-editorial-hero.png";
import haenyeoImage from "../assets/jeju-haenyeo.png";
import seongsanImage from "../assets/jeju-seongsan.png";
import { getDestinations } from "../api";
import type { Destination } from "../types";

const imageByKey: Record<string, string> = {
    seongsan: seongsanImage,
    hallasan: editorialHero,
    seopjikoji: editorialHero,
    manjanggul: seongsanImage,
    "folk-village": haenyeoImage,
    seongeup: haenyeoImage,
};

export default function ExplorePage() {
    const [places, setPlaces] = useState<Destination[]>([]);
    const [error, setError] = useState("");
    useEffect(() => {
        void getDestinations()
            .then((result) => setPlaces(result.items))
            .catch((reason: Error) => setError(reason.message));
    }, []);
    return (
        <EditorialLayout>
            <main className="route-main explore-route">
                <header className="route-hero">
                    <span>CURATED PLACES · ISSUE 01</span>
                    <h1>
                        Explore
                        <br />
                        <em>Jeju.</em>
                    </h1>
                    <p>
                        Volcanic landscapes, living heritage, and coastal roads
                        — sample data verified against Visit Jeju.
                    </p>
                </header>
                {error && <Alert color="red">{error}</Alert>}
                <section className="explore-list">
                    {!places.length &&
                        !error &&
                        [1, 2, 3].map((i) => (
                            <Skeleton key={i} height={520} radius="xl" />
                        ))}
                    {places.map((place, index) => (
                        <article key={place.id}>
                            <div className="explore-number">
                                {String(index + 1).padStart(2, "0")}
                            </div>
                            <div className="portfolio-image">
                                <img
                                    src={
                                        imageByKey[place.image_key] ||
                                        editorialHero
                                    }
                                    alt={place.name}
                                />
                                <span>VIEW PLACE</span>
                            </div>
                            <div>
                                <Badge variant="light" color="pink">
                                    {place.category}
                                </Badge>
                                <h2>{place.name}</h2>
                                <p className="place-description">
                                    {place.description}
                                </p>
                                <small>
                                    <MapPin size={13} /> {place.address}
                                </small>
                                <div className="place-actions">
                                    <Button
                                        component={Link}
                                        to="/lich-trinh"
                                        radius="xl"
                                        color="dark"
                                        rightSection={
                                            <ArrowUpRight size={16} />
                                        }
                                    >
                                        Add to itinerary
                                    </Button>
                                    <Button
                                        component="a"
                                        href={place.source_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        variant="subtle"
                                        color="dark"
                                        rightSection={
                                            <ExternalLink size={14} />
                                        }
                                    >
                                        Source
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </EditorialLayout>
    );
}
