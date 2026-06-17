import DemoBusinessPage from "@/components/business/DemoBusinessPage";
import { DEMO_BUSINESSES, DEMO_SERVICES_VETERINARIA, DEMO_COUPONS_VETERINARIA, DEMO_REVIEWS_VETERINARIA } from "@/lib/demo-data";

export default function VeterinariaPage() {
  const business = DEMO_BUSINESSES.find((b) => b.id === "demo-veterinaria")!;
  return (
    <DemoBusinessPage
      business={business}
      products={DEMO_SERVICES_VETERINARIA}
      coupons={DEMO_COUPONS_VETERINARIA}
      reviews={DEMO_REVIEWS_VETERINARIA}
      emoji="🐾"
      productLabel="Servicios veterinarios"
    />
  );
}
