import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

//  remove non ascii characters
export function convertToAscii(input: string): string {
  return input.replace(/[^\x00-\x1F\x21-\x2C\x2E-\x7F]+/g, "");
}
