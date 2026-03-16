import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { MarketplacePage } from "../dashboard/MarketplacePage";

export const PublicMarketplacePage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 mt-20">
                <MarketplacePage isPublic={true} />
            </main>
            <Footer />
        </div>
    );
};
