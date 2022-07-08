// This file is for handling input and output. Feel free to add your own IO methods here.

/**
 * A simple method to easily import files that have a default export.
 * 
 * @param path - The path to the file.
 */
export async function defaultImport(path: string): Promise<any> {
    return (await import(path))?.default
}