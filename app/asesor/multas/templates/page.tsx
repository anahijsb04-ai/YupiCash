// app/multas/templates/page.tsx
import TemplatesView from "./TemplatesView";

export default function TemplatesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Plantillas</h1>
      <TemplatesView />
    </div>
  );
}
