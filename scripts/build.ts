import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

import { getFilesRecursiv } from "./helper";

const srcDir = path.join(__dirname, "..", "src");
const outputDir = path.join(__dirname, "..", "output", "dist");
let typescriptFilesToCompile: string[] = [];
let reportDiagnostic: boolean = false;

const folderToCheck = [
    {
        "srcName": "electron",
        "outDir": outputDir
    },
    {
        "srcName": "common",
        "outDir": path.join(outputDir, "common")
    }
]

const copyFiles = [
    {
        "file": "../build/Release/ec_access.node",
        "dest": path.join(outputDir, "modules")
    },
    {
        "file": "../src/data/fantables.json",
        "dest": path.join(outputDir, "data")
    },
    {
        "file": "../src/data/32x32.png",
        "dest": path.join(outputDir, "data")
    },
    {
        "file": "../src/data/tuxedofancontrol.service",
        "dest": path.join(outputDir, "data")
    },
    {
        "file": "../LICENSE",
        "dest": outputDir
    }
]

console.log("Build parameter: " + process.argv);
process.argv.forEach(function (parameter, index, array) {
    if(parameter == "--rd")
    {
        reportDiagnostic = true;
    }
});

for(let file of copyFiles)
{
    console.log("file: " + file.file);
    console.log("destination: " + file.dest);

    if (!fs.existsSync(file.dest))
    {
        fs.mkdirSync(file.dest);
    }

    const file_destination = path.join(file.dest, path.basename(file.file));
    fs.copyFileSync(path.join(__dirname, file.file), file_destination);
}

for(let folder of folderToCheck)
{
    let files = getFilesRecursiv(path.join(srcDir, folder.srcName));

    for(const file of files)
    {
        const file_destination = path.join(folder.outDir, path.basename(file));
        const folder_destination = folder.outDir;

        console.log("destination: " + folder_destination)

        if (!fs.existsSync(folder.outDir))
        {
            fs.mkdirSync(folder.outDir);
        }

        console.log("Copy file: '" + file + "' to '" + file_destination + "'")
        fs.copyFileSync(file, file_destination);

        if (path.extname(file_destination).toLowerCase() === ".ts")
        {
            typescriptFilesToCompile.push(file_destination);
        }

        if (path.extname(file_destination).toLowerCase() === ".ts")
        {
            console.log("Compile Typescript file: '" + file_destination + "'");
            let ts_config = {
                "compilerOptions": {
                    "baseUrl": "./",
                    "outDir": folder.outDir,
                    "sourceMap": false,
                    "declaration": false,
                    "moduleResolution": "node",
                    "emitDecoratorMetadata": true,
                    "experimentalDecorators": true,
                    "target": "es6",
                    "types" : ["node"],
                    "lib": [
                        "es6",
                        "dom",
                        "dom.iterable",
                        "scripthost"
                    ]
                }
            };

            let program = ts.createProgram([file_destination], <any>ts_config);
            let emitResult = program.emit();

            if(reportDiagnostic)
            {
                reportDiagnostics(ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));
            }

            fs.unlinkSync(file_destination);
        }
    }
}

function reportDiagnostics(diagnostics: ts.Diagnostic[]): void
{
    diagnostics.forEach(diagnostic => {
        let message = "Diagnostic Result:";
        if (diagnostic.file)
        {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
        }

        message += ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
}
