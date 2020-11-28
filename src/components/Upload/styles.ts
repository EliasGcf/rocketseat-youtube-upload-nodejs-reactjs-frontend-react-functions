import styled, { css } from "styled-components";
import { DropzoneRootProps } from 'react-dropzone';

interface MessageColorsProps {
  default: string;
  error: string;
  success: string;
}

interface UploadMessageProps {
  type?: 'default' | 'error' | 'success';
}

interface DropContainerProps extends DropzoneRootProps {
  isDragActive: boolean;
  isDragReject: boolean;
}

const messageColors: MessageColorsProps = {
  default: "#999",
  error: "#e57878",
  success: "#78e5d5"
};

const dragActive = css`
  border-color: #78e5d5;
`;

const dragReject = css`
  border-color: #e57878;
`;

export const DropContainer = styled.div.attrs({
  className: "dropzone"
})<DropContainerProps>`
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: height 0.2s ease;
  ${props => props.isDragActive && dragActive};
  ${props => props.isDragReject && dragReject};
`;

export const UploadMessage = styled.p<UploadMessageProps>`
  display: flex;
  color: ${props => messageColors[props.type || "default"]};
  justify-content: center;
  align-items: center;
  padding: 15px 0;
`;
