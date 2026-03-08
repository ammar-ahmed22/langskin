export type { KeywordName, LangskinSpec, PartialLangskinSpec } from "./schema";

/**
 * Result of spec validation.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
