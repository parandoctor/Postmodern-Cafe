import { AuthParticleBackground } from "@/components/ui/auth-particle-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black">
      <AuthParticleBackground />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
