"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, Car, Receipt } from "lucide-react";
import TripTypeCategoryTab from "./components/TripTypeCategoryTab";
import VehicleCategoryTab from "./components/VehicleCategoryTab";
import ExpenseCategoryTab from "./components/ExpenseCategoryTab";

export default function CategoriesPage() {
  const [tab, setTab] = useState("trip-types");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Quản lý danh mục
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Quản lý các danh mục loại chuyến đi, phương tiện và chi phí
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-10">
          <TabsTrigger value="trip-types" className="gap-1.5 text-[13px]">
            <Compass className="h-3.5 w-3.5" />
            Loại chuyến đi
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-1.5 text-[13px]">
            <Car className="h-3.5 w-3.5" />
            Phương tiện
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5 text-[13px]">
            <Receipt className="h-3.5 w-3.5" />
            Chi phí
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trip-types" className="mt-4">
          <TripTypeCategoryTab />
        </TabsContent>
        <TabsContent value="vehicles" className="mt-4">
          <VehicleCategoryTab />
        </TabsContent>
        <TabsContent value="expenses" className="mt-4">
          <ExpenseCategoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
