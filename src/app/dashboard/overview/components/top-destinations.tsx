import { ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const topDestinations = [
  { name: "Hà Giang", trips: 89, rating: 4.8, growth: "+23%", img: "🏔️" },
  { name: "Đà Lạt", trips: 76, rating: 4.7, growth: "+15%", img: "🌺" },
  { name: "Phú Quốc", trips: 64, rating: 4.6, growth: "+31%", img: "🏖️" },
  { name: "Hội An", trips: 52, rating: 4.9, growth: "+8%", img: "🏮" },
  { name: "Sa Pa", trips: 48, rating: 4.5, growth: "+12%", img: "🌄" },
];

export function TopDestinations() {
  return (
    <Card className="lg:col-span-5 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Điểm đến phổ biến</CardTitle>
          <CardDescription className="text-[13px]">Xếp hạng theo số chuyến đi</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground hover:text-foreground h-7">
          Xem tất cả <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {topDestinations.map((dest, idx) => (
            <div key={dest.name} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/30 transition-colors -mx-1">
              <span className="text-[13px] font-medium text-muted-foreground/50 w-4 tabular-nums">{idx + 1}</span>
              <span className="text-lg">{dest.img}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground">{dest.name}</p>
                <p className="text-[11px] text-muted-foreground">{dest.trips} chuyến đi · <Star className="inline h-3 w-3 text-amber-400 fill-amber-400 -mt-0.5" /> {dest.rating}</p>
              </div>
              <span className="text-[12px] font-medium text-emerald-600">{dest.growth}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
