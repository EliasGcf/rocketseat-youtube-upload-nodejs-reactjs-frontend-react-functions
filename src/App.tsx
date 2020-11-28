import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import filesize from 'filesize';

import api from './services/api';

import GlobalStyle from './styles/global';
import { Container, Content } from './styles';

import Upload from './components/Upload';
import FileList from './components/FileList'

interface UploadedFilesProps {
  file?: File;
  id: string;
  name: string;
  readableSize: string;
  preview: string;
  progress?: number;
  uploaded: boolean;
  error?: boolean;
  url: string | null;
}

interface UpdateFileData {
  progress?: number;
  id?: string;
  uploaded?: boolean;
  error?: boolean;
  url?: string;
}

interface PostsResponse {
  _id: string;
  name: string;
  readableSize: string;
  preview: string;
  uploaded: boolean;
  url: string;
  size: number;
}

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesProps[]>([]);

  useEffect(() => {
    async function loadPosts() {
      const response = await api.get<PostsResponse[]>('posts');

      const data = response.data.map(file => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url,
      }));

      setUploadedFiles(data);
    }

    loadPosts()
  }, []);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [uploadedFiles]);

  function updateFile(id: string, data: UpdateFileData) {
    setUploadedFiles(state => state.map(uploadedFile => {
      if (id === uploadedFile.id) {
        return { ...uploadedFile, ...data }
      }

      return uploadedFile;
    }));
  }

  async function processUpload(uploadedFile: UploadedFilesProps) {
    try {
      const data = new FormData();

      if (!uploadedFile.file) return;

      data.append('file', uploadedFile.file, uploadedFile.name);

      const response = await api.post('posts', data, {
        onUploadProgress: (event: ProgressEvent) => {
          console.log('load', event.loaded)
          const progress = Math.round((event.loaded * 100)/event.total);

          updateFile(uploadedFile.id, { progress });
        }
      });

      updateFile(uploadedFile.id, {
        uploaded: true,
        id: response.data._id,
        url: response.data.url,
      });
    } catch (err) {
      updateFile(uploadedFile.id, {
        error: true,
      });
    }
  }

  function handleUpload(files: File[]) {
    const formatedFiles = files.map(file => ({
      file,
      id: uuidV4(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
    }));

    const newUploadedFiles = [...uploadedFiles, ...formatedFiles]

    setUploadedFiles(newUploadedFiles);
    formatedFiles.forEach(processUpload);
  }

  async function handleDelete(id: string) {
    await api.delete(`posts/${id}`);

    setUploadedFiles(files => files.filter(file => file.id !== id));
  }

  return (
    <Container>
      <GlobalStyle />
      <Content>
        <Upload onUpload={handleUpload} />
        {!!uploadedFiles.length && (
          <FileList files={uploadedFiles} onDelete={handleDelete} />
        )}
      </Content>
    </Container>
  );
}

export default App;
