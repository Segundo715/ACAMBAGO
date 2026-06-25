import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function RegisterPage() {
  return <SignUp appearance={clerkAppearance} />;
}
