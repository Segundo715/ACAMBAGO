import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import DemoLoginButtons from "@/components/ui/DemoLoginButtons";

export default function LoginPage() {
  return (
    <>
      <SignIn appearance={clerkAppearance} signUpUrl="/register" />
      <DemoLoginButtons />
    </>
  );
}
