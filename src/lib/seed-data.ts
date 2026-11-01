import type { ExamInput } from "@/types";

/** Students (full names as given: first name, surname, father's name). */
export const STUDENTS: string[] = [
  "Aliyə İsgəndər Fərhad",
  "Aygün Nəcəfova Taleh",
  "Emin Eminov Valeh",
  "Əlirza Əyyubzadə Fuad",
  "Hüseyn Məmmədov Amil",
  "Kamran Guseinovi Aslan",
  "Sənan Nəbiyev Seymur",
  "Yunis Abulov Rauf",
  "Zərifə İlyasova Elmaz",
];

export const STUDENT_EMAIL_DOMAIN = "student.examhub.az";

/** "Əlirza Əyyubzadə Fuad" -> "elirza.eyyubzade@student.examhub.az" */
export function toEmail(fullName: string): string {
  const ascii = (s: string) =>
    s
      .replace(/ə/g, "e")
      .replace(/Ə/g, "e")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const [first, last] = fullName.split(/\s+/);
  return `${ascii(first)}.${ascii(last)}@${STUDENT_EMAIL_DOMAIN}`;
}

export const SAMPLE_EXAM: ExamInput = {
  title: { en: "General Knowledge", az: "Ümumi biliklər" },
  description: {
    en: "A short warm-up exam with six questions on geography, science and maths.",
    az: "Coğrafiya, elm və riyaziyyat üzrə altı sualdan ibarət qısa isinmə imtahanı.",
  },
  durationMinutes: 15,
  passingScore: 60,
  published: true,
  questions: [
    {
      text: { en: "What is the capital of Azerbaijan?", az: "Azərbaycanın paytaxtı hansı şəhərdir?" },
      options: [
        { en: "Baku", az: "Bakı" },
        { en: "Ganja", az: "Gəncə" },
        { en: "Sumqayit", az: "Sumqayıt" },
        { en: "Shaki", az: "Şəki" },
      ],
      correctIndex: 0,
    },
    {
      text: { en: "What is 7 × 8?", az: "7 × 8 neçə edir?" },
      options: [
        { en: "54", az: "54" },
        { en: "56", az: "56" },
        { en: "58", az: "58" },
        { en: "64", az: "64" },
      ],
      correctIndex: 1,
    },
    {
      text: {
        en: "Which is the largest planet in the Solar System?",
        az: "Günəş sistemində ən böyük planet hansıdır?",
      },
      options: [
        { en: "Earth", az: "Yer" },
        { en: "Mars", az: "Mars" },
        { en: "Jupiter", az: "Yupiter" },
        { en: "Venus", az: "Venera" },
      ],
      correctIndex: 2,
    },
    {
      text: { en: "What is the chemical formula of water?", az: "Suyun kimyəvi formulu hansıdır?" },
      options: [
        { en: "O2", az: "O2" },
        { en: "H2O", az: "H2O" },
        { en: "CO2", az: "CO2" },
        { en: "NaCl", az: "NaCl" },
      ],
      correctIndex: 1,
    },
    {
      text: {
        en: "Which sea does Azerbaijan have a coast on?",
        az: "Azərbaycan hansı dənizin sahilində yerləşir?",
      },
      options: [
        { en: "Black Sea", az: "Qara dəniz" },
        { en: "Caspian Sea", az: "Xəzər dənizi" },
        { en: "Mediterranean Sea", az: "Aralıq dənizi" },
        { en: "Baltic Sea", az: "Baltik dənizi" },
      ],
      correctIndex: 1,
    },
    {
      text: { en: "How many continents are there on Earth?", az: "Yer kürəsində neçə qitə var?" },
      options: [
        { en: "5", az: "5" },
        { en: "6", az: "6" },
        { en: "7", az: "7" },
        { en: "8", az: "8" },
      ],
      correctIndex: 2,
    },
  ],
};
