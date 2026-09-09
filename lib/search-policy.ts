export function mayIndex(preview: boolean, deploymentEnvironment?: string) {
  return !preview && deploymentEnvironment !== 'preview';
}
export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
