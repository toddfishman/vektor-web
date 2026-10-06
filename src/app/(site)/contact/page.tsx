import type { Metadata } from "next";
import Link from "next/link";
import { SimpleForm } from "@/components/forms/simple-form";
import { AgentChat } from "@/components/agent/agent-chat";
import { AgentActions, EmailActions, Escalation } from "@/components/site/contact-actions";
import { Offices } from "@/components/site/sections";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to a Vektor agent, 24/7/365. Offices in Monterey, Fresno, Fontana, Pleasanton and Lakewood Ranch, FL.",
};

export default async function Contact({ searchParams }: PageProps<"/contact">) {
  const { topic } = await searchParams;
  const callback = topic === "callback";
  return (
    <>
      <div className="spacer-hdr" />
      <section className="sec agent-sec">
        <div className="wrap agent-grid">
          <div className="agent-head">
            <p className="tag">Contact</p>
            <h1>Talk to an agent.</h1>
            <p className="lede">Ask Vektor&rsquo;s AI agent anything about shipping or hauling with us. It can start your quote or get a person to call you back, any hour.</p>
          </div>
          <AgentChat />
          <div className="agent-alt">
            <p className="agent-or">Rather talk to a person?</p>
            <div className="btns"><AgentActions chat={false} /><EmailActions /></div>
            <Escalation />
          </div>
        </div>
      </section>
      <Offices title="Five offices. One team." strip={false} />
      <section className="sec paper" id="message">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <p className="tag">{callback ? "Request a callback" : "Send a message"}</p>
            <h2>{callback ? "A Vektor agent will call you." : "We’ll route it to the right desk."}</h2>
            <p className="lede" style={{ marginTop: "1.2rem" }}>
              {callback
                ? <>Leave a number and what it’s about. Agents are on 24/7/365, or call <a href={`tel:${site.agent.phone.tel}`}>{site.agent.phone.display}</a> now.</>
                : <>Shipping freight? The <Link href="/quote">quote builder</Link> is fastest. Hauling? Go to <Link href="/carriers#cform">carrier setup</Link>.</>}
            </p>
          </div>
          <SimpleForm kind="contact" cta={callback ? "Call me back" : "Send"} fields={[
            { name: "topic", label: "", type: "hidden", defaultValue: callback ? "callback" : "general" },
            { name: "name", label: "Name", required: true, autoComplete: "name" },
            { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
            { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", required: callback },
            { name: "company", label: "Company", autoComplete: "organization" },
            { name: "role", label: "I am a", type: "select", options: ["Shipper", "Carrier", "Job seeker", "Other"] },
            { name: "message", label: callback ? "What’s it about?" : "Message", type: "textarea" },
          ]} />
        </div>
      </section>
    </>
  );
}
