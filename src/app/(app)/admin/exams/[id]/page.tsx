import { notFound } from "next/navigation";
import ExamEditor from "@/components/ExamEditor";
import { getDict } from "@/i18n/server";
import { getExam } from "@/lib/exams";

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await getExam(id);
  if (!exam) notFound();
  const { t } = await getDict();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black md:text-4xl">{t.editor.editTitle}</h1>
      <ExamEditor examId={exam.id} initial={exam} />
    </div>
  );
}
