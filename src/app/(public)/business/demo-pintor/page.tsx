import DemoBusinessPage from "@/components/business/DemoBusinessPage";
import { DEMO_BUSINESSES, DEMO_SERVICES_PINTOR, DEMO_COUPONS_PINTOR, DEMO_REVIEWS_PINTOR } from "@/lib/demo-data";

export default function PintorPage() {
  const business = DEMO_BUSINESSES.find((b) => b.id === "demo-pintor")!;
  return (
    <DemoBusinessPage
      business={business}
      products={DEMO_SERVICES_PINTOR}
      coupons={DEMO_COUPONS_PINTOR}
      reviews={DEMO_REVIEWS_PINTOR}
      emoji="🎨"
      productLabel="Servicios de pintura"
    />
  );
}
