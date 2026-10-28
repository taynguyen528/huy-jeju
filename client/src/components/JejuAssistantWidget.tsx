import { Link } from "react-router-dom";

export default function JejuAssistantWidget() {
    return (
        <Link
            className="jeju-assistant-widget"
            to="/lich-trinh"
            aria-label="Mở Trợ lý Jeju"
        >
            <span className="jeju-assistant-label">Trợ lý Jeju</span>
            <img src="/img_al-transparent.png" alt="" aria-hidden="true" />
        </Link>
    );
}
