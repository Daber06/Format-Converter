/*
const fs = require('fs-extra');  // File operations (reading folders, copying files)
const path = require('path'); 
const {exec} = require('child_process'); // "{}" means it's a destructuring assignment, which grabs the properties of an object and the built in child_process module lets node run other programs, ffmpeg in this case
const sharp = require('sharp'); // Image conversion
const inquirer = require('inquirer'); // Helps with the user interactivity in the terminal

const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.mts', '.mkv', 'webm'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.tiff', '.gif', '.bmp', '.cr3'];

async function main() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'mediaType',
            message: 'What type of files do you want to convert?',
            choices: ['Videos', 'Images']
        },
        {
            type: 'input',
            name: 'inputFolder',
            message: 'Drag and drop the folder with files here:',
            filter: input => input.trim().replace(/^"(.*)"$/, '$1') // input.trim() removes spaces from start and end of input     /^"(.*)"$/, '$1' means that if the entire input starts and ends with double quotes, remove them and return just what's inside    
        },
        {
            type: 'input',
            name: 'outputFormat',
            message: answers => `Convert ${answers.mediaType.toLowerCase()} to which format? (e.g., mp4, jpg)`, 
        }
    ]);

    const { mediaType, inputFolder, outputFormat } = answers;
    const isVideo = mediaType === 'Videos';
    const validExts = isVideo ? VIDEO_EXTS : IMAGE_EXTS; // Conditional operator

    const outputFolder = path.join(inputFolder, 'convertede');
    fs.ensureDirSync(outputFolder);
}
    */

const fs = require('fs');                 // File operations (reading folders, copying files)
const path = require('path');
const { exec } = require('child_process');
const readline = require('node:readline/promises');
const util = require('util');             // Build in Node.js module that provides utility functions and in this case to promisify an exec function
const execPromise = util.promisify(exec);

const input = readline.createInterface({  // readline is a build-in Node.js module that allows you to read text input from a user in the terminal, line by line
    input: process.stdin,                 // process is a globl Node.js object that gives access to information about the running Node process
    output: process.stdout                // stdin & stdout writes the input and writes the outback, in the terminal
});

// A Promise is a built-in JS object that represents something that will be completed later e.g. getting user input, waiting for a timer
// Resolve is a function provided by the Promise that you call when your task is done

/*
function ask(q) {
    return new Promise(res => input.question(q, res));
}*/

async function converter() {
    const srcFolder  = await input.question('Source folder: ');
    const dstFolder  = await input.question('Destination folder: ');
    const fromFormat = (await input.question('Convert from: ')).toLowerCase();
    const toFormat   = (await input.question('Convert to: ')).toLowerCase();
    
    input.close();

    // Removes quotes, because often when users copy a file adress, it comes with quotes
    const src = srcFolder.replace(/"/g, '');
    const dst = dstFolder.replace(/"/g, '');

    // Makes sure the destination exists
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true}); // existsSync instead of exists, because it's synchronus which stops the program until the task is finished   Recursive is there to not get errors if you were to create a path, but the parentfolders doesn't exist

    // Reads and filters files by extension
    const files = fs.readdirSync(src).filter(f => {             // readdirSync reads the content of the src folder      Filter is an array method that returns a new array containg only items that passed the test
        return path.extname(f).toLowerCase() === `.${fromFormat}`;  // path.extname(f) checks the extensions for each file in the array and filters away those that dont match
    });

    if (files.length === 0) {
        console.log(`No *.${fromFormat} files found in ${src}` );
        return;
    }

    // Converts each file
    for (const file of files) {
        //console.log(`file = ${file}, ext = ${path.extname(file)}`);
        const name       = path.basename(file, path.extname(file));  // Takes the name of only the file from the path and removes the extension 
        const outputFile = `${name}.${toFormat}`;
        const inputPath  = path.join(src, file);                   // path.join combines mutiple paths
        const outputPath = path.join(dst, outputFile);

        //FFmpeg handles both video and image conversion here
        const cmd = `ffmpeg -y -i "${inputPath}" "${outputPath}"`;

        console.log(file + " --> " + outputFile);

        try {
            await execPromise(cmd);
            console.log("Done: " + outputFile);
        } catch (err) {
            console.error(`Failed: ${file}\n${err.stderr || err}`)
        }
    }
};
converter(); 

