import { Navbar } from "@/components/publik/navbar";
import { Footer } from "@/components/publik/footer";

export default function PublikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}