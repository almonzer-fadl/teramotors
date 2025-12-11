import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import Backup from '@/lib/models/Backup';
import { IBackup } from '@/lib/models/Backup';

const execAsync = promisify(exec);

async function getDocumentCounts(): Promise<{counts: Record<string, number>, collectionNames: string[]}> {
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not initialized');
    }
    const collections = await db.listCollections().toArray();
    const counts: Record<string, number> = {};
    const collectionNames = collections.map(c => c.name);
    for (const collection of collections) {
        if(collection.type === 'view') continue;
        const count = await db.collection(collection.name).countDocuments();
        counts[collection.name] = count;
    }
    return {counts, collectionNames};
}

export async function createFullBackup(userId: mongoose.Types.ObjectId): Promise<IBackup> {
    const backupDir = process.env.BACKUP_STORAGE_PATH || path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `backup_full_${timestamp}.gz`;
    const backupPath = path.join(backupDir, filename);

    const {counts, collectionNames} = await getDocumentCounts();

    const backupDoc = await Backup.create({
        type: 'full',
        filename,
        filepath: backupPath,
        size: 0, // placeholder
        status: 'in_progress',
        createdBy: userId,
        metadata: {
            documentCounts: counts,
            collections: collectionNames
        }
    });

    try {
        const command = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${backupPath}" --gzip`;
        const { stderr } = await execAsync(command);

        if (stderr) {
            // mongodump sometimes writes to stderr on success, so we check for actual error keywords
            if (stderr.toLowerCase().includes('error') || stderr.toLowerCase().includes('failed')) {
                throw new Error(stderr);
            }
        }
        
        const stats = await fs.stat(backupPath);

        backupDoc.status = 'completed';
        backupDoc.completedAt = new Date();
        backupDoc.size = stats.size;
        await backupDoc.save();

        return backupDoc;

    } catch (error) {
        console.error("Backup failed:", error)
        backupDoc.status = 'failed';
        await backupDoc.save();
        // remove the failed backup file
        try {
            await fs.unlink(backupPath);
        } catch (unlinkError) {
            console.error("Failed to delete incomplete backup file:", unlinkError);
        }
        throw error;
    }
}
