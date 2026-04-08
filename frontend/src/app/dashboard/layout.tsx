import { DashboardNavbar } from "@/components/dashboard/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans antialiased min-h-screen bg-background text-foreground">
      <DashboardNavbar />
      {children}
    </div>
  );
}