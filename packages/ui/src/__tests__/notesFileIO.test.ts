import { saveNotesToFile, loadNotesFromFile } from "../contexts/notesFileIO";

function makeFileHandleRef(val: any = null): React.MutableRefObject<any | null> {
  return { current: val } as React.MutableRefObject<any | null>;
}

const DATA_START = "// ========= DATA START =========";
const DATA_END = "// ========= DATA END =========";

function makeHtmlWithData(jsonStr: string): string {
  return `<html><script>const data = ${DATA_START}\n${jsonStr}\n${DATA_END};</script></html>`;
}

function makeFile(content: string, name = "notes.html"): File {
  return new File([content], name, { type: "text/html" });
}

beforeEach(() => {
  document.body.innerHTML = "";
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(window, "alert").mockImplementation(() => {});
  URL.createObjectURL = jest.fn().mockReturnValue("blob:mock");
  URL.revokeObjectURL = jest.fn();
  delete (window as any).showSaveFilePicker;
  delete (window as any).showOpenFilePicker;
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── saveNotesToFile ──────────────────────────────────────────────────────────

describe("saveNotesToFile", () => {
  test("uses download fallback when showSaveFilePicker is undefined", async () => {
    const appendSpy = jest.spyOn(document.body, "appendChild");
    const notes = [{ book: "Genesis", chapterNumber: 1, text: "Hello" }];
    const articles = [{ id: "intro", text: "Introduction" }];

    await saveNotesToFile(notes, articles, makeFileHandleRef());

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  test("generated HTML contains DATA START/END markers and JSON", async () => {
    let capturedBlob: Blob | null = null;
    URL.createObjectURL = jest.fn().mockImplementation((b: Blob) => {
      capturedBlob = b;
      return "blob:mock";
    });

    const notes = [{ book: "Genesis", chapterNumber: 1, text: "Note" }];
    await saveNotesToFile(notes, [], makeFileHandleRef());

    expect(capturedBlob).not.toBeNull();
    const text = await capturedBlob!.text();
    expect(text).toContain(DATA_START);
    expect(text).toContain(DATA_END);
    expect(text).toContain('"Genesis"');
  });

  test("uses showSaveFilePicker when available", async () => {
    const writable = {
      write: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const handle = {
      createWritable: jest.fn().mockResolvedValue(writable),
    };
    (window as any).showSaveFilePicker = jest.fn().mockResolvedValue(handle);

    const fileHandleRef = makeFileHandleRef();
    await saveNotesToFile([], [], fileHandleRef);

    expect((window as any).showSaveFilePicker).toHaveBeenCalled();
    expect(writable.write).toHaveBeenCalled();
    expect(writable.close).toHaveBeenCalled();
    // handle should be stored
    expect(fileHandleRef.current).toBe(handle);
  });

  test("reuses existing fileHandleRef when available", async () => {
    const writable = {
      write: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const existingHandle = {
      createWritable: jest.fn().mockResolvedValue(writable),
    };
    (window as any).showSaveFilePicker = jest.fn().mockResolvedValue(existingHandle);

    const fileHandleRef = makeFileHandleRef(existingHandle);
    await saveNotesToFile([], [], fileHandleRef);

    // Should NOT call showSaveFilePicker since handle already exists
    expect((window as any).showSaveFilePicker).not.toHaveBeenCalled();
    expect(writable.write).toHaveBeenCalled();
  });

  test("calls alert when save fails", async () => {
    URL.createObjectURL = jest.fn().mockImplementation(() => {
      throw new Error("mock error");
    });

    await saveNotesToFile([], [], makeFileHandleRef());

    expect(window.alert).toHaveBeenCalledWith("Saving notes was cancelled or failed.");
  });
});

// ─── loadNotesFromFile ────────────────────────────────────────────────────────

describe("loadNotesFromFile", () => {
  function setupShowOpenFilePicker(content: string) {
    const file = makeFile(content);
    (window as any).showOpenFilePicker = jest.fn().mockResolvedValue([{
      getFile: () => Promise.resolve(file),
    }]);
  }

  test("loads notes and articles from HTML file with DATA markers", async () => {
    const data = { notes: [{ book: "Genesis", chapterNumber: 1, text: "Hello" }], articles: [{ id: "intro", text: "Intro" }], savedAt: "2024-01-01" };
    const content = makeHtmlWithData(JSON.stringify(data));
    setupShowOpenFilePicker(content);

    const fileHandleRef = makeFileHandleRef();
    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(fileHandleRef, replaceAllNotes, replaceAllArticles);

    expect(replaceAllNotes).toHaveBeenCalledWith(data.notes);
    expect(replaceAllArticles).toHaveBeenCalledWith(data.articles);
  });

  test("loads notes-only object from HTML file", async () => {
    const data = { notes: [{ book: "Exodus", chapterNumber: 2, text: "Text" }], savedAt: "" };
    setupShowOpenFilePicker(makeHtmlWithData(JSON.stringify(data)));

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(replaceAllNotes).toHaveBeenCalledWith(data.notes);
    expect(replaceAllArticles).toHaveBeenCalledWith([]);
  });

  test("loads plain JSON array", async () => {
    const data = [{ book: "John", chapterNumber: 3, text: "For God so loved" }];
    setupShowOpenFilePicker(JSON.stringify(data));

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(replaceAllNotes).toHaveBeenCalledWith(data);
    expect(replaceAllArticles).toHaveBeenCalledWith([]);
  });

  test("loads plain JSON object with notes array", async () => {
    const data = { notes: [{ book: "Matthew", chapterNumber: 5, text: "Blessed" }] };
    setupShowOpenFilePicker(JSON.stringify(data));

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(replaceAllNotes).toHaveBeenCalledWith(data.notes);
  });

  test("wraps plain string as single note", async () => {
    const data = "Some plain text";
    setupShowOpenFilePicker(JSON.stringify(data));

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(replaceAllNotes).toHaveBeenCalledWith([
      { book: null, chapterNumber: 1, text: "Some plain text" },
    ]);
  });

  test("wraps plain JSON object with .text property as single note", async () => {
    const data = { book: null, chapterNumber: 1, text: "Single note" };
    setupShowOpenFilePicker(JSON.stringify(data));

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(replaceAllNotes).toHaveBeenCalledWith([data]);
  });

  test("calls alert on malformed JSON", async () => {
    setupShowOpenFilePicker("{ not valid json !");

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(window.alert).toHaveBeenCalledWith("Loading notes was cancelled or failed.");
    expect(replaceAllNotes).not.toHaveBeenCalled();
  });

  test("calls alert when showOpenFilePicker throws (user cancelled)", async () => {
    (window as any).showOpenFilePicker = jest.fn().mockRejectedValue(new Error("User cancelled"));

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(window.alert).toHaveBeenCalledWith("Loading notes was cancelled or failed.");
  });

  test("does nothing when file is null (fallback path)", async () => {
    // Force fallback path: no showOpenFilePicker
    delete (window as any).showOpenFilePicker;

    // Mock document.createElement for input
    const originalCreate = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === "input") {
        // Simulate clicking without selecting a file
        jest.spyOn(el as HTMLInputElement, "click").mockImplementation(() => {
          setTimeout(() => {
            (el as any).onchange && (el as any).onchange();
          }, 0);
        });
        Object.defineProperty(el, "files", { get: () => null });
      }
      return el;
    });

    const replaceAllNotes = jest.fn();
    const replaceAllArticles = jest.fn();

    await loadNotesFromFile(makeFileHandleRef(), replaceAllNotes, replaceAllArticles);

    expect(replaceAllNotes).not.toHaveBeenCalled();
  });

  test("stores file handle from showOpenFilePicker", async () => {
    const data = { notes: [], articles: [] };
    const file = makeFile(JSON.stringify(data));
    const handle = { getFile: () => Promise.resolve(file) };
    (window as any).showOpenFilePicker = jest.fn().mockResolvedValue([handle]);

    const fileHandleRef = makeFileHandleRef();
    await loadNotesFromFile(fileHandleRef, jest.fn(), jest.fn());

    expect(fileHandleRef.current).toBe(handle);
  });
});
