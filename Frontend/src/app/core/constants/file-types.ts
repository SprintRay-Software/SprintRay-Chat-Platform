export const ImageFileTypes = {
    jpeg: 'jpeg',
    jpg: 'jpg',
    png: 'png',
    gif: 'gif',
    svg: 'svg',
    bmp: 'bmp',
} as const;

export const VideoFileTypes = {
    mp4: 'mp4',
    mov: 'mov',
};

export const FileTypes = {
    spr: 'spr',
    stl: 'stl',
    drc: 'drc',
    obj: 'obj',
    pdf: 'pdf',
    folder: 'folder',
    ply: 'ply',
    sdsplink: 'sdsplink',
    link: 'link',
    ...ImageFileTypes,
    ...VideoFileTypes,
} as const;
