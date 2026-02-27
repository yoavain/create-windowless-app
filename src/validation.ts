import type { InvalidNames, LegacyNames, ValidNames } from "validate-npm-package-name";
import validateProjectName from "validate-npm-package-name";

export const validateProjectNameInput = (value: string): string | boolean => {
    const result: ValidNames | InvalidNames | LegacyNames = validateProjectName(value);
    if (result.validForNewPackages) {
        return true;
    }
    if ((result as InvalidNames)?.errors?.[0]) {
        return (result as InvalidNames).errors[0];
    }
    if ((result as LegacyNames)?.warnings?.[0]) {
        return (result as LegacyNames).warnings[0];
    }
    return "Invalid project name";
};
