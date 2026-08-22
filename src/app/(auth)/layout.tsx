import { AuthEarthBackground } from "@/components/ui/auth-earth-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black">
      <AuthEarthBackground />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
