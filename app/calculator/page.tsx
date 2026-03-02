import TravelCalculatorPhoton from "@/app/components/TravelCalculatorPhoton";
import { BEAUTICIAN } from "@/app/data/services";

export default function CalculatorPage() {
    return (
        <main className="page-container">
            <header className="brand-header">
                <img
                    src="/logo.webp"
                    alt="Beauty by Design Logo"
                    className="brand-logo"
                />
                <h1 className="brand-name">{BEAUTICIAN.businessName}</h1>
                <p className="brand-tagline">
                    Transparent Pricing · Professional Service ✨
                </p>
            </header>

            <div style={{ padding: '20px 0' }}>
                <TravelCalculatorPhoton />
            </div>
        </main>
    );
}
