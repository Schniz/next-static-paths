export function filePathToPathname(
  pageExtensions: readonly string[],
  filePath: string
): string {
  const extensionsRegex = new RegExp(`\\.(${pageExtensions.join("|")})$`);
  return filePath
    .replace(extensionsRegex, "")
    .replace(/^/, "/")
    .replace(/\/(_middleware|index)$/, "")
    .replace(/\/+$/, "")
    .replace(/^$/, "/");
}
