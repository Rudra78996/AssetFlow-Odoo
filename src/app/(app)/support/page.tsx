"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  HelpCircle, MessageSquare, BookOpen, Mail, Phone, ExternalLink,
  ChevronDown, ChevronRight, Search, Send, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How do I allocate an asset to an employee?",
    a: "Go to the Allocations page and click 'New Allocation'. Select the asset, the employee, and the expected return date. Manager or Admin role is required to approve allocations.",
  },
  {
    q: "How do I report a maintenance issue?",
    a: "Navigate to Maintenance → click 'Raise Request'. Select the asset, describe the issue, choose a priority level, and submit. A technician will be assigned automatically.",
  },
  {
    q: "What is the difference between 'Booking' and 'Allocation'?",
    a: "An Allocation is a long-term assignment of an asset to an employee. A Booking is a short-term time-slot reservation for shared/bookable assets (e.g. a conference room laptop).",
  },
  {
    q: "How do I start an audit cycle?",
    a: "Go to Audits → click 'Start New Audit Cycle'. Define the scope, assign auditors, and set the date range. Assets within scope will appear for verification.",
  },
  {
    q: "Can I export reports?",
    a: "Yes. On the Reports or Dashboard page use the 'Export Report' button to download a summary. Full CSV exports per module are available from each list view.",
  },
  {
    q: "How are overdue returns flagged?",
    a: "The system automatically marks an allocation as OVERDUE when the expected return date passes without a return record. A nightly cron job checks and updates statuses.",
  },
  {
    q: "How do I manage departments and categories?",
    a: "Navigate to Org Setup (Admin only). From there you can create/edit departments, set department heads, and manage asset categories with custom fields.",
  },
  {
    q: "Why can't I see certain menu items?",
    a: "Menu items are role-based. Employees see a limited set of views. Managers see allocation and maintenance tools. Admins have full access including Org Setup, Settings, and Reports.",
  },
];

export default function SupportPage() {
  const { addToast } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [ticket, setTicket] = useState({ subject: "", category: "bug", message: "" });
  const [ticketSent, setTicketSent] = useState(false);
  const [sending, setSending] = useState(false);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.subject || !ticket.message) {
      addToast({ message: "Please fill in all fields", type: "error" });
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setTicketSent(true);
    addToast({ message: "Support ticket submitted successfully!", type: "success" });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display font-display text-on-surface">Help &amp; Support</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Find answers, troubleshoot issues, or reach our support team.
        </p>
      </div>

      {/* Quick contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <BookOpen className="w-6 h-6" />,
            label: "Documentation",
            desc: "Guides, API docs, and tutorials",
            action: "Open Docs",
            color: "text-primary bg-primary/5 border-primary/20",
          },
          {
            icon: <MessageSquare className="w-6 h-6" />,
            label: "Live Chat",
            desc: "Mon–Fri, 9am–6pm IST",
            action: "Start Chat",
            color: "text-secondary bg-secondary-container/30 border-secondary/20",
          },
          {
            icon: <Mail className="w-6 h-6" />,
            label: "Email Support",
            desc: "Response within 24 hours",
            action: "Send Email",
            color: "text-tertiary bg-tertiary-container/10 border-tertiary/20",
          },
        ].map(({ icon, label, desc, action, color }) => (
          <button
            key={label}
            onClick={() => addToast({ message: `Opening ${label}...`, type: "info" })}
            className={cn("card card-hover p-5 text-left flex flex-col gap-3 border", color)}
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
              {icon}
            </div>
            <div>
              <p className="font-headline-md text-headline-md text-on-surface">{label}</p>
              <p className="text-body-md text-on-surface-variant mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-1 text-label-md font-semibold">
              {action} <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Frequently Asked Questions</h2>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {filteredFaqs.length === 0 ? (
          <p className="text-body-md text-on-surface-variant text-center py-6">No FAQs match your search.</p>
        ) : (
          <div className="divide-y divide-outline-variant">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="py-4">
                <button
                  className="flex items-start justify-between w-full text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <p className={cn("font-body-md font-semibold text-on-surface", openFaq === i && "text-primary")}>
                    {faq.q}
                  </p>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-outline flex-shrink-0 mt-0.5 transition-transform",
                      openFaq === i && "rotate-180 text-primary"
                    )}
                  />
                </button>
                {openFaq === i && (
                  <p className="text-body-md text-on-surface-variant mt-3 leading-relaxed pr-8">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Ticket */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Submit a Support Ticket</h2>
        </div>

        {ticketSent ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-available/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-available" />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Ticket Submitted!</h3>
            <p className="text-body-md text-on-surface-variant max-w-sm">
              Your support request has been received. Our team will respond within 24 hours.
            </p>
            <button onClick={() => { setTicketSent(false); setTicket({ subject: "", category: "bug", message: "" }); }} className="btn-secondary mt-2">
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Subject</label>
                <input
                  type="text"
                  value={ticket.subject}
                  onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                  className="input-field"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="label-field">Category</label>
                <select
                  value={ticket.category}
                  onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                  className="input-field"
                >
                  <option value="bug">Bug / Error</option>
                  <option value="feature">Feature Request</option>
                  <option value="access">Access / Permissions</option>
                  <option value="data">Data Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-field">Message</label>
              <textarea
                value={ticket.message}
                onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                className="input-field resize-none"
                rows={5}
                placeholder="Describe your issue in detail. Include steps to reproduce if applicable."
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={sending} className="btn-primary disabled:opacity-60">
                <Send className="w-4 h-4" />
                {sending ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Contact info footer */}
      <div className="flex flex-wrap gap-6 text-body-md text-on-surface-variant">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>+1 (800) 555-0100</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span>support@assetflow.io</span>
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          <span>docs.assetflow.io</span>
        </div>
      </div>
    </div>
  );
}
