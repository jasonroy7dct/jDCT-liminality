/**
 * Google Drive Service for Liminality
 * Handles file search, creation, read, and write operations using the Google Drive API.
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
}

export class GoogleDriveService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED: Request had invalid authentication credentials.');
      }
      const error = await response.json();
      throw new Error(error.error?.message || 'Google Drive API error');
    }

    return response.json();
  }

  /**
   * Finds the liminality_data.json file in the user's Google Drive.
   */
  async findDataFile(): Promise<GoogleDriveFile | null> {
    const query = encodeURIComponent("name = 'liminality_data.json' and trashed = false");
    const data = await this.fetchWithAuth(
      `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name)`
    );

    return data.files.length > 0 ? data.files[0] : null;
  }

  /**
   * Creates a new liminality_data.json file.
   */
  async createDataFile(content: any): Promise<GoogleDriveFile> {
    const metadata = {
      name: 'liminality_data.json',
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create file on Google Drive');
    }

    return response.json();
  }

  /**
   * Reads the content of a file by ID.
   */
  async readFile(fileId: string): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to read file from Google Drive');
    }

    return response.json();
  }

  /**
   * Updates the content of an existing file.
   */
  async updateFile(fileId: string, content: any): Promise<void> {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update file on Google Drive');
    }
  }
}
