import { AgentBar } from "@/components/site/agent-bar";
import { Band, Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Band />
      <Footer />
      <AgentBar />
    </>
  );
}
