export const extractAnchorElements = (text: string) => {
    const urlPattern =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/gi;
    return text.replace(urlPattern, url => {
        return `<a href="${url}" class="changeStatusToMessagedLabClass dark-a" target="_blank">${url}</a>`;
    });
};
