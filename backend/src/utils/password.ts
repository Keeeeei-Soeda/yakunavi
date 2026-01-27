import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * パスワードをハッシュ化
 */
export const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
};

/**
 * パスワードを検証
 */
export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
};

