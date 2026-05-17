// app/multas/new/page.tsx
import NewTemplateForm from "../components/NewTemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva plantilla</h1>
      <NewTemplateForm />
    </div>
  );
}
