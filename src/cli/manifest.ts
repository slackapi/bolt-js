import fs from 'fs';
import path from 'path';

// Manifest script hook returns a manifest JSON if it exists in the working directory
(function _(cwd: string): void {
  // TODO: Support additonal accepted formats
  // const acceptedFormat = ['json', 'yml', 'ts'];
  try {
    const fileData = fs.readFileSync(path.resolve(cwd, 'manifest.json'), 'utf8');
    process.stdout.write(fileData);
  } catch (error) {
    // TODO: Throw a coded error
    process.stdout.write(`Failed to find a manifest file in this project: ${error}`);
  }
}(process.cwd()));
