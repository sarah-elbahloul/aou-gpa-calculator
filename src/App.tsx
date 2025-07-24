import { Router, Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Home from "./pages/home";
import NotFound from "./pages/not-found";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router base={import.meta.env.PROD ? "/aou-gpa-calculator" : undefined}>
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </TooltipProvider>
  );
}

export default App;
