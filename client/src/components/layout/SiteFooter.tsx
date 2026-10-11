import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
export default function SiteFooter() {
    const { t } = useI18n();
    return (
        <footer className="editorial-footer">
            <div>
                <Link className="footer-brand" to="/">
                    JEJU
                </Link>
                <p>
                    {t("footer.mission")
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
                    <strong>{t("footer.explore").toUpperCase()}</strong>
                    <Link to="/kham-pha">{t("nav.explore")}</Link>
                    <Link to="/lich-trinh">{t("nav.planner")}</Link>
                </div>
                <div>
                    <strong>{t("footer.journal").toUpperCase()}</strong>
                    <Link to="/van-hoa">{t("nav.culture")}</Link>
                    <Link to="/gioi-thieu">{t("nav.about")}</Link>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© 2026 JEJU — {t("footer.rights")}</span>
                <span>MADE WITH CARE FOR JEJU</span>
            </div>
        </footer>
    );
}
