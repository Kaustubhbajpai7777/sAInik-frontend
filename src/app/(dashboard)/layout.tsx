import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/">
      <div className="min-h-screen bg-[#2d3748]">
        {/* Sidebar - Single instance that handles both desktop and mobile */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="lg:ml-64 min-h-screen">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}