import * as fs from "fs";

export function getFilesRecursiv(dir: string, paramFiles: string[] = []): string[]
{
    paramFiles = paramFiles || [];
    var files = fs.readdirSync(dir);

    for (let i in files)
    {
        const name = dir + "/" + files[i];

        if (fs.statSync(name).isDirectory())
        {
            getFilesRecursiv(name, paramFiles);
        }
        else
        {
            paramFiles.push(name);
        }
    }

    return paramFiles;
}

