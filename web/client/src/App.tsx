// Black Ledger style reminder: the app shell is permanently dark; theme switching would dilute the protocol’s instrument language.

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import Home from "./pages/Home";

import GigExchangePage from "./pages/GigExchangePage";
import PredictionMarketPage from "./pages/PredictionMarketPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/exchange" component={GigExchangePage} />
      <Route path="/markets" component={PredictionMarketPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <WalletProvider>
          <TooltipProvider>
            <Toaster theme="dark" />
            <Router />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


export default App;
