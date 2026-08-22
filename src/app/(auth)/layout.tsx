import { AuthTdBackground } from "@/components/ui/auth-td-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black">
      <AuthTdBackground />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
