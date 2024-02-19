import { removeFileExtensionsForMdFiles } from './fileExtensionStripper'

test('Strips file extension from markdown link', () => {
    expect(removeFileExtensionsForMdFiles("This is a link to a [file](file.md)")).toBe("This is a link to a [file](file)");
  });

// TODO: Add one or two more unit tests