import { FileTypes } from './file-types';

export const FileTypeIconMap: Partial<Record<(typeof FileTypes)[keyof typeof FileTypes], string>> = {
    pdf: 'file-type-pdf',
    link: 'file-type-link',
};
