import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import Home from "@/pages/home";
import ServicesPage from "@/pages/services";
import ServiceDetailPage from "@/pages/service-detail";
import ComicSubmissionsPage from "@/pages/comic-submissions";
import BookAShowPage from "@/pages/book-a-show";
import NotFound from "@/pages/not-found";
import SponsorshipsPage from "@/pages/sponsorships";
import AboutPage from "@/pages/about";
import ComediansPage from "@/pages/comedians";
import MediaPage from "@/pages/media";
import MerchPage from "@/pages/merch";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/comic-submissions" component={ComicSubmissionsPage} />
      <Route path="/sponsorships" component={SponsorshipsPage} />
      <Route path="/book-a-show" component={BookAShowPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/comedians" component={ComediansPage} />
      <Route path="/media" component={MediaPage} />
      <Route path="/merch" component={MerchPage} />
      <Route path="/live-show-production">
        <ServiceDetailPage slug="live-show-production" />
      </Route>
      <Route path="/comedian-booking">
        <ServiceDetailPage slug="comedian-booking" />
      </Route>
      <Route path="/corporate-events">
        <ServiceDetailPage slug="corporate-events" />
      </Route>
      <Route path="/media-and-podcasts">
        <ServiceDetailPage slug="media-and-podcasts" />
      </Route>
      <Route path="/headshots-and-promo">
        <ServiceDetailPage slug="headshots-and-promo" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <LocalBusinessJsonLd />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
