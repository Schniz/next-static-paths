export function pageFilePathToPathname(
  pageExtensions: readonly string[],
  filePath: string,
): string {
  const extensionsRegex = new RegExp(`\\.(${pageExtensions.join("|")})$`);
  return filePath
    .replace(extensionsRegex, "")
    .replace(/\([^)]+\)/g, "")
    .replace(/^/, "/")
    .replace(/\/(_middleware|index)$/, "")
    .replace(/\/+$/, "")
    .replace(/^$/, "/");
}

export function appFilePathToPathname(
  pageExtensions: readonly string[],
  filePath: string,
): string {
  const extensionsRegex = new RegExp(`\\page.(${pageExtensions.join("|")})$`);
  return (
    filePath
      .replace(extensionsRegex, "")
      // (thing)/ => /
      .replace(/\([^)]+\)\//g, "")
      .replace(/\/([^/]+)$/, "")
      .replace(/^/, "/")
      .replace(/\/+$/, "")
      .replace(/^$/, "/")
      .replace(/\[\[(.*?)]]/g, "[$1]")
      .replace(/\/@[^/]+/, "")
  );
}
