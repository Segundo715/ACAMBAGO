import DemoBusinessPage from "@/components/business/DemoBusinessPage";
import { DEMO_BUSINESSES, DEMO_SERVICES_LAVADO, DEMO_COUPONS_LAVADO, DEMO_REVIEWS_LAVADO } from "@/lib/demo-data";

export default function LavadoPage() {
  const business = DEMO_BUSINESSES.find((b) => b.id === "demo-lavado")!;
  return (
    <DemoBusinessPage
      business={business}
      products={DEMO_SERVICES_LAVADO}
      coupons={DEMO_COUPONS_LAVADO}
      reviews={DEMO_REVIEWS_LAVADO}
      emoji="🚗"
      productLabel="Servicios disponibles"
    />
  );
}
