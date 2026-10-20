import {
  pick,
  saveDocuments,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { exportBackupJSON, parseBackupJSON, BackupData } from './backupStorage';

const EXPORT_FILE_NAME = () =>
  `budget-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;

/** True if the given error represents the user cancelling a picker/save dialog. */
export const isUserCancellation = (error: unknown): boolean =>
  isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED;

/**
 * Builds the current app data as JSON, writes it to a temporary file, then
 * opens the native "save file" dialog so the user can store or share it
 * wherever they like. Resolves with the chosen file name, or `null` if the
 * user cancelled.
 */
export const exportBackupToFile = async (): Promise<string | null> => {
  const json = await exportBackupJSON();
  const fileName = EXPORT_FILE_NAME();
  const tempPath = `${RNFS.TemporaryDirectoryPath}${fileName}`;

  await RNFS.writeFile(tempPath, json, 'utf8');

  try {
    const [result] = await saveDocuments({
      sourceUris: [`file://${tempPath}`],
      fileName,
      mimeType: 'application/json',
      copy: true,
    });
    return result.name ?? fileName;
  } catch (error) {
    if (isUserCancellation(error)) {
      return null;
    }
    throw error;
  } finally {
    RNFS.unlink(tempPath).catch(() => {
      // Best-effort cleanup of the temp file; nothing to do if it fails.
    });
  }
};

/**
 * Opens the native document picker so the user can choose a previously
 * exported backup JSON file, reads and validates it. Resolves with the
 * parsed backup data, or `null` if the user cancelled.
 */
export const pickAndParseBackupFile = async (): Promise<BackupData | null> => {
  let pickResult;
  try {
    [pickResult] = await pick({
      mode: 'open',
      type: ['application/json', 'public.json'],
    });
  } catch (error) {
    if (isUserCancellation(error)) {
      return null;
    }
    throw error;
  }

  const raw = await RNFS.readFile(pickResult.uri, 'utf8');
  return parseBackupJSON(raw);
};
