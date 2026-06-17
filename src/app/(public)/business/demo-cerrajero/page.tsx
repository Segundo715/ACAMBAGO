import DemoBusinessPage from "@/components/business/DemoBusinessPage";
import { DEMO_BUSINESSES, DEMO_SERVICES_CERRAJERO, DEMO_COUPONS_CERRAJERO, DEMO_REVIEWS_CERRAJERO } from "@/lib/demo-data";

export default function CerrajeroPage() {
  const business = DEMO_BUSINESSES.find((b) => b.id === "demo-cerrajero")!;
  return (
    <DemoBusinessPage
      business={business}
      products={DEMO_SERVICES_CERRAJERO}
      coupons={DEMO_COUPONS_CERRAJERO}
      reviews={DEMO_REVIEWS_CERRAJERO}
      emoji="🔑"
      productLabel="Servicios de cerrajería"
    />
  );
}
