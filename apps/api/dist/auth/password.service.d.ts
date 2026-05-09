export declare class PasswordService {
    constructor();
    hash(password: string): Promise<string>;
    verify(hash: string, password: string): Promise<boolean>;
    validateStrength(password: string, userInputs?: string[]): boolean;
}
