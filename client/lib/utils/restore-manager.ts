import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function restoreFullBackup(filepath: string): Promise<void> {
  try {
    const command = `mongorestore --uri="${process.env.MONGODB_URI}" --drop --gzip --archive="${filepath}"`;
    console.log(`Starting restore from: ${filepath}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      // mongorestore can write to stderr even on success
      console.warn('mongorestore stderr:', stderr);
    }
    
    console.log('mongorestore stdout:', stdout);
    console.log(`Restore completed successfully from: ${filepath}`);

  } catch (error) {
    console.error(`Failed to restore backup from: ${filepath}`, error);
    throw new Error('Backup restore failed.');
  }
}
