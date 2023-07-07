import type { InvalidNames, LegacyNames, ValidNames } from "validate-npm-package-name";
import validateProjectName from "validate-npm-package-name";

export const validateProjectNameInput = (value: string): string | boolean => {
    const result: ValidNames | InvalidNames | LegacyNames = validateProjectName(value);
    return result.validForNewPackages || ((result as InvalidNames)?.errors?.[0]) || ((result as LegacyNames)?.warnings?.[0]) || "Invalid project name";
};
