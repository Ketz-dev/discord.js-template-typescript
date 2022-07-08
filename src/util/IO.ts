
// easily import stuff
export async function defaultImport(path: string): Promise<any> {
    return (await import(path))?.default
}