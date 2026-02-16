import bcrypt from 'bcrypt';

export const hashPasswword = async (password) => {
    return bcrypt.hash(password,10);
}

export const comparePassword = async (password,hashPasswword) => {
    return bcrypt.compare(password,hashPasswword)
}