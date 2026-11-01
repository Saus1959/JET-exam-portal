import ExamEditor from "@/components/ExamEditor";
import { getDict } from "@/i18n/server";

export default async function NewExamPage() {
  const { t } = await getDict();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black md:text-4xl">{t.editor.newTitle}</h1>
      <ExamEditor />
    </div>
  );
}
