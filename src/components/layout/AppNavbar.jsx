import { Link, useLocation } from "react-router-dom";
import { UtensilsCrossed, Menu, Search, Calendar, Heart, Home } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function AppNavbar() {
  const location = useLocation();
  const { favorites } = useFavorites();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { to: "/search", label: "Search", icon: <Search className="w-4 h-4" /> },
    { to: "/planner", label: "Planner", icon: <Calendar className="w-4 h-4" /> },
    { to: "/favorites", label: "Favorites", icon: <Heart className="w-4 h-4" /> },
  ];

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "text-primary border-b-2 border-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md"
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <UtensilsCrossed className="w-6 h-6 text-primary" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                RecipeNest
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className={getLinkClasses(link.to)}>
                  {link.icon}
                  <span>{link.label}</span>
                  {link.to === "/favorites" && favorites.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary hover:bg-primary/20">
                      {favorites.length}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center gap-2 mb-8 mt-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-serif text-xl font-bold">RecipeNest</span>
                </div>
                <div className="flex flex-col space-y-4">
                  {links.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {link.icon}
                        <span className="text-base">{link.label}</span>
                        {link.to === "/favorites" && favorites.length > 0 && (
                          <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">
                            {favorites.length}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
