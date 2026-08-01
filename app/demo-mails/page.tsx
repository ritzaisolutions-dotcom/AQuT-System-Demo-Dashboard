import { DemoMailButtons } from "./demo-mail-buttons";

export const dynamic = "force-dynamic";

export default function DemoMailsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Demo-Mails</h1>
        <p className="text-sm text-slate-600">
          Vier feste WF5-Vorlagen für Vertriebsgespräche. Kein Status-Update am
          Lead — nur Versand über n8n.
        </p>
      </div>
      <DemoMailButtons />
    </div>
  );
}
