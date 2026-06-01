import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, UserCredential } from 'firebase/auth';

/**
 * Dynamically fetches Firebase config from backend and signs in with Google requesting Drive scope.
 * Returns the access token for Google API or null.
 */
export async function getGoogleDriveToken(): Promise<{ accessToken: string; email: string; name: string } | null> {
  try {
    // Fetch firebase-applet-config dynamically to avoid compile errors if file is generated later
    const res = await fetch('/firebase-applet-config.json');
    if (!res.ok) {
      throw new Error('Google services configurations are being initialized. Please try again in a moment!');
    }
    const firebaseConfig = await res.json();
    
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    // Scope required to save/create files in user's Google Drive
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    // Scope required to authorize Gemini API on behalf of the user's Google Account
    provider.addScope('https://www.googleapis.com/auth/generative-language.tuning');
    // Ensure we select accounts
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result: UserCredential = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential?.accessToken) {
      return {
        accessToken: credential.accessToken,
        email: result.user.email || '',
        name: result.user.displayName || 'Google Kullanıcısı'
      };
    }
    return null;
  } catch (error: any) {
    console.error('Google Auth & Drive Scope authorization failed:', error);
    throw error;
  }
}

/**
 * Saves or updates standard JSON backup file inside Google Drive.
 */
export async function saveBackupToGoogleDrive(accessToken: string, payload: any): Promise<{ fileId: string; webViewLink?: string }> {
  try {
    // 1. Search for existing file named 'mbg_ai42_backup.json'
    const query = encodeURIComponent("name = 'mbg_ai42_backup.json' and trashed = false");
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      throw new Error(`Google Drive Search Error: ${errText}`);
    }

    const searchData = await searchRes.json();
    const existingFile = searchData.files && searchData.files[0];

    let fileId = '';
    let webViewLink = '';

    if (existingFile) {
      fileId = existingFile.id;
      webViewLink = existingFile.webViewLink || '';
      
      // 2. Update existing file content
      const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        throw new Error(`Google Drive Update Error: ${errText}`);
      }
    } else {
      // 3. Create a new file with metadata
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'mbg_ai42_backup.json',
          mimeType: 'application/json'
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Google Drive Creation Error: ${errText}`);
      }

      const createdFile = await createRes.json();
      fileId = createdFile.id;
      webViewLink = createdFile.webViewLink || '';

      // 4. Upload file content
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Google Drive Content Upload Error: ${errText}`);
      }
    }

    return { fileId, webViewLink };
  } catch (error: any) {
    console.error('saveBackupToGoogleDrive error:', error);
    throw error;
  }
}
