import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FolderView from "@/pages/FolderView";
import AllFiles from "@/pages/AllFiles";
import Settings from "@/pages/Settings";
import { LanguageProvider } from "@/hooks/useLanguage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/folder/:id" component={FolderView} />
      <Route path="/files" component={AllFiles} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
