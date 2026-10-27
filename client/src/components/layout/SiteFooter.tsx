import { Link } from "react-router-dom";
export default function SiteFooter() {
    return (
        <footer className="editorial-footer">
            <div>
                <Link className="footer-brand" to="/">
                    JEJU
                </Link>
                <p>
                    {"Travel slower. Look deeper.\nPreserve the stories of Jeju."
                        .split("\n")
                        .map((line) => (
                            <span key={line}>
                                {line}
                                <br />
                            </span>
                        ))}
                </p>
            </div>
            <div className="footer-links">
                <div>
                    <strong>EXPLORE</strong>
                    <Link to="/kham-pha">Explore</Link>
                    <Link to="/lich-trinh">Itinerary</Link>
                </div>
                <div>
                    <strong>JOURNAL</strong>
                    <Link to="/van-hoa">Jeju Culture</Link>
                    <Link to="/gioi-thieu">About</Link>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© 2026 JEJU — ALL RIGHTS RESERVED</span>
                <span>MADE WITH CARE FOR JEJU</span>
            </div>
        </footer>
    );
}
