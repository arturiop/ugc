import type { LANGUAGES } from "@/editor/constants/language-constants";

export type Language = (typeof LANGUAGES)[number];
export type LanguageCode = Language["code"];
