export type Role = "admin" | "user";
export type Locale = "en" | "az";

export interface Localized {
  en: string;
  az: string;
}

export interface QuestionInput {
  text: Localized;
  options: Localized[];
  correctIndex: number;
}

export interface ExamInput {
  title: Localized;
  description: Localized;
  durationMinutes: number;
  passingScore: number;
  published: boolean;
  questions: QuestionInput[];
}

export interface ExamDTO extends ExamInput {
  id: string;
}

export type AttemptStatus = "in_progress" | "finished";

export interface AttemptDTO {
  id: string;
  userId: string;
  examId: string;
  examTitle: Localized;
  answers: number[];
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
  finishedAt: string | null;
}

export interface AttemptWithUser extends AttemptDTO {
  userName: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** True when the admin can reveal this student's password. */
  hasPassword: boolean;
  createdAt: string;
}
