import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function restoreFullBackup(filepath: string): Promise<void> {
  try {
    const command = `mongorestore --uri="${process.env.MONGODB_URI}" --drop --gzip --archive="${filepath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      // mongorestore can write to stderr even on success
    }
    

  } catch (error) {
    throw new Error('Backup restore failed.');
  }
}
