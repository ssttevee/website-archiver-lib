export const defaultExtensionsMap: Record<string, string> = {
  "text/html": "html",
};

export default function createExtensionFixer(
  extensionsMap: Record<string, string>,
): (filepath: string, contentType: string | null) => string {
  return (filepath, contentType) => {
    if (filepath.split("/").slice(-1)[0].split(".").length > 1) {
      // it already has an extension! don't need to add another one
      return filepath;
    }

    if (filepath[filepath.length - 1] === "/") {
      filepath += "index";
    } else if (filepath[filepath.length - 1] === ".") {
      filepath = filepath.slice(0, -1);
    }

    const extFromContentType = contentType && extensionsMap[contentType];
    return filepath + (extFromContentType ? `.${extFromContentType}` : "");
  };
}
