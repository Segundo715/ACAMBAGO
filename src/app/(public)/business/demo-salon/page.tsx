import DemoBusinessPage from "@/components/business/DemoBusinessPage";
import { DEMO_BUSINESSES, DEMO_SERVICES_SALON, DEMO_COUPONS_SALON, DEMO_REVIEWS_SALON } from "@/lib/demo-data";

export default function SalonPage() {
  const business = DEMO_BUSINESSES.find((b) => b.id === "demo-salon")!;
  return (
    <DemoBusinessPage
      business={business}
      products={DEMO_SERVICES_SALON}
      coupons={DEMO_COUPONS_SALON}
      reviews={DEMO_REVIEWS_SALON}
      emoji="💅"
      productLabel="Servicios de belleza"
    />
  );
}
