import { removeFileExtensionForMdFilesInLinks } from './fileExtensionStripper'

test('Strips file extension from markdown link', () => {
  expect(removeFileExtensionForMdFilesInLinks("This is a link to a [file](file.md)")).toBe("This is a link to a [file](file)");
});

// TODO: Add one or two more unit tests