import { last } from 'lodash-es';

export const downloadFile = (link: string, fileName?: string | null) => {
    try {
        const url = new URL(link);
        fileName ??= last(url.pathname.split('/')) ?? '';
        const anchor = document.createElement('a');
        anchor.href = url.href;
        anchor.target = '_blank';
        anchor.download = fileName;
        anchor.click();
    } catch (e) {
        console.warn(`Unable to download, link ${link} is invalid`);
    }
};
