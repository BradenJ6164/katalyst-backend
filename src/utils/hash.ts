export async function hashPassword(password: string, salt: string): Promise<string> {
    const utf8 = new TextEncoder().encode(`${salt}:${password}`);

    const hashBuffer = await crypto.subtle.digest({name: 'SHA-256'}, utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');
}

export function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}
