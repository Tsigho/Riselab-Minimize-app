import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { CreateProductWizard } from "./pages/dashboard/products/CreateProductWizard"; // Import wizard
import { MarketplacePage } from "./pages/dashboard/MarketplacePage";
import { PublicMarketplacePage } from "./pages/public/PublicMarketplacePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CheckoutPage } from "./pages/public/CheckoutPage";
import { CheckoutSuccessPage } from "./pages/public/CheckoutSuccessPage";
import { AdminPage } from "./pages/dashboard/AdminPage";

import { DashboardLayout } from "./layouts/DashboardLayout";
import { OverviewPage } from "./pages/dashboard/OverviewPage";
import { TransactionsPage } from "./pages/dashboard/TransactionsPage";
import { ProductsPage } from "./pages/dashboard/ProductsPage";
import { MessagesPage } from "./pages/dashboard/MessagesPage";
import { FinancialPage } from "./pages/dashboard/FinancialPage";
import { ToolsPage } from "./pages/dashboard/ToolsPage";
import { WhatsAppPage } from "./pages/dashboard/tools/whatsapp";
import { WebhooksPage } from "./pages/dashboard/tools/Webhooks";
import { AffiliatesPage } from "./pages/dashboard/AffiliatesPage";
import { MyLibrary } from "./pages/dashboard/library/MyLibrary";
import { ProductViewer } from "./pages/dashboard/library/ProductViewer";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UTMTracker } from "./components/analytics/UTMTracker";
import { RastroCapture } from "./components/tracking/RastroCapture"; // Importe o componente
import { NewClientsPage } from "./pages/dashboard/NewClientsPage";
import "./index.css";

import { Toaster } from "sonner"; // Import Toaster

import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeSwitcher } from "./components/ThemeSwitcher";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark-colorful">
        <Router>
          <ThemeSwitcher /> {/* Floating Global Switcher */}
          <UTMTracker />
          <RastroCapture /> {/* 2. Injete aqui. Ele roda silenciosamente em background. */}
          <Toaster richColors position="top-right" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/marketplace" element={<PublicMarketplacePage />} />

            {/* Public Checkout Routes */}
            <Route path="/checkout/:productId" element={<CheckoutPage />} />
            <Route path="/checkout/:productId/success" element={<CheckoutSuccessPage />} />

            {/* 🚀 A NOVA ROTA DO ADMIN AQUI */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<OverviewPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="clients" element={<NewClientsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<CreateProductWizard />} />
              <Route path="products/edit/:id" element={<CreateProductWizard />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="tools" element={<ToolsPage />} />
              <Route path="tools/whatsapp" element={<WhatsAppPage />} />
              <Route path="tools/webhooks" element={<WebhooksPage />} />
              <Route path="affiliates" element={<AffiliatesPage />} />
              <Route path="financial" element={<FinancialPage />} />
              <Route path="library" element={<MyLibrary />} />
              <Route path="library/:productId" element={<ProductViewer />} />
              {/* Withdraw Page Placeholder reuse Transactions or new page? Using div for now if not created */}
              <Route path="withdraw" element={<FinancialPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
