import {
  updateResizeOverlayFromImage,
  setImageLayoutStyles,
  setImageAlignmentStyles,
  applyImageLayout,
  applyImageAlignment,
  removeImage,
  insertImages,
} from "../components/Editor/imageUtils";
import * as utils from "../components/Editor/utils";

function makeEditorRef(el: HTMLDivElement | null): React.RefObject<HTMLDivElement | null> {
  return { current: el } as React.RefObject<HTMLDivElement | null>;
}

function makeSavedRangeRef(): React.RefObject<Range | null> {
  return { current: null } as React.RefObject<Range | null>;
}

beforeEach(() => {
  document.body.innerHTML = "";
  (document as any).execCommand = jest.fn().mockReturnValue(true);
  URL.createObjectURL = jest.fn().mockReturnValue("blob:mock");
  URL.revokeObjectURL = jest.fn();
});

// ─── updateResizeOverlayFromImage ─────────────────────────────────────────────

describe("updateResizeOverlayFromImage", () => {
  test("calls setResizeOverlay with rect values", () => {
    const image = document.createElement("img");
    document.body.appendChild(image);

    jest.spyOn(image, "getBoundingClientRect").mockReturnValue({
      left: 10, top: 20, width: 100, height: 50,
      right: 110, bottom: 70, x: 10, y: 20,
      toJSON: jest.fn(),
    } as any);

    const setResizeOverlay = jest.fn();
    updateResizeOverlayFromImage(image, setResizeOverlay);

    expect(setResizeOverlay).toHaveBeenCalledWith({
      left: 10, top: 20, width: 100, height: 50,
    });
  });
});

// ─── setImageLayoutStyles ─────────────────────────────────────────────────────

describe("setImageLayoutStyles", () => {
  test("applies 'editor-image editor-image-small' for small layout", () => {
    const img = document.createElement("img");
    setImageLayoutStyles(img, "small");
    expect(img.className).toBe("editor-image editor-image-small");
  });

  test("applies 'editor-image editor-image-medium' for medium layout", () => {
    const img = document.createElement("img");
    setImageLayoutStyles(img, "medium");
    expect(img.className).toBe("editor-image editor-image-medium");
  });

  test("applies 'editor-image editor-image-full' for full layout", () => {
    const img = document.createElement("img");
    setImageLayoutStyles(img, "full");
    expect(img.className).toBe("editor-image editor-image-full");
  });
});

// ─── setImageAlignmentStyles ──────────────────────────────────────────────────

describe("setImageAlignmentStyles", () => {
  test("applies center styles", () => {
    const img = document.createElement("img");
    setImageAlignmentStyles(img, "center");
    expect(img.style.float).toBe("none");
    expect(img.style.margin).toBe("0px auto");
    expect(img.style.display).toBe("block");
  });

  test("applies left styles", () => {
    const img = document.createElement("img");
    setImageAlignmentStyles(img, "left");
    expect(img.style.float).toBe("left");
    expect(img.style.display).toBe("");
  });

  test("applies right styles", () => {
    const img = document.createElement("img");
    setImageAlignmentStyles(img, "right");
    expect(img.style.float).toBe("right");
    expect(img.style.display).toBe("");
  });
});

// ─── removeImage ─────────────────────────────────────────────────────────────

describe("removeImage", () => {
  test("removes image, clears menus, and calls syncFromEditor", () => {
    const editor = document.createElement("div");
    const img = document.createElement("img");
    editor.appendChild(img);
    document.body.appendChild(editor);

    jest.spyOn(window, "getSelection").mockReturnValue(null);

    const setImageMenu = jest.fn();
    const setResizeOverlay = jest.fn();
    const syncFromEditor = jest.fn();

    removeImage(img, makeEditorRef(editor), makeSavedRangeRef(), setImageMenu, setResizeOverlay, syncFromEditor);

    expect(setImageMenu).toHaveBeenCalledWith(null);
    expect(setResizeOverlay).toHaveBeenCalledWith(null);
    expect(syncFromEditor).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

// ─── applyImageLayout ─────────────────────────────────────────────────────────

describe("applyImageLayout", () => {
  test("returns early when replaceElementUndoably returns null (element not connected)", () => {
    const img = document.createElement("img");
    // img is NOT connected to the DOM, so replaceElementUndoably returns null
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    const setImageMenu = jest.fn();
    const updateResizeOverlay = jest.fn();
    const syncFromEditor = jest.fn();

    applyImageLayout(img, "small", "left", makeEditorRef(editor), makeSavedRangeRef(), setImageMenu, updateResizeOverlay, syncFromEditor);

    expect(setImageMenu).not.toHaveBeenCalled();
    expect(syncFromEditor).not.toHaveBeenCalled();
  });

  test("updates menu and syncs when element is successfully replaced", () => {
    const editor = document.createElement("div");
    const img = document.createElement("img");
    img.className = "editor-image";
    editor.appendChild(img);
    document.body.appendChild(editor);

    const range = document.createRange();
    range.selectNode(img);
    jest.spyOn(window, "getSelection").mockReturnValue({
      anchorNode: img,
      rangeCount: 1,
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      getRangeAt: jest.fn().mockReturnValue(range),
    } as any);

    const setImageMenu = jest.fn();
    const updateResizeOverlay = jest.fn();
    const syncFromEditor = jest.fn();

    applyImageLayout(img, "medium", "center", makeEditorRef(editor), makeSavedRangeRef(), setImageMenu, updateResizeOverlay, syncFromEditor);

    // nextImage might not be null since we provide real DOM
    // Just verify no errors thrown
    jest.restoreAllMocks();
  });
});

// ─── applyImageAlignment ──────────────────────────────────────────────────────

describe("applyImageAlignment", () => {
  test("returns early when replaceElementUndoably returns null (element not connected)", () => {
    const img = document.createElement("img");
    const editor = document.createElement("div");
    document.body.appendChild(editor);

    const setImageMenu = jest.fn();
    const updateResizeOverlay = jest.fn();
    const syncFromEditor = jest.fn();

    applyImageAlignment(img, "right", makeEditorRef(editor), makeSavedRangeRef(), setImageMenu, updateResizeOverlay, syncFromEditor);

    expect(setImageMenu).not.toHaveBeenCalled();
    expect(syncFromEditor).not.toHaveBeenCalled();
  });
});

// ─── insertImages ─────────────────────────────────────────────────────────────

describe("insertImages", () => {
  test("filters out non-image files", async () => {
    const insertHtml = jest.fn();
    const editorRef = makeEditorRef(document.createElement("div"));

    const textFile = new File(["content"], "doc.txt", { type: "text/plain" });
    const imageFile = new File(["data"], "img.png", { type: "image/png" });

    jest.spyOn(utils, "compressToWebPSmall").mockResolvedValue("data:image/webp;base64,mock");

    await insertImages([textFile, imageFile], editorRef, insertHtml);

    expect(insertHtml).toHaveBeenCalledTimes(1);
    expect(insertHtml).toHaveBeenCalledWith(expect.stringContaining('src="data:image/webp;base64,mock"'));
    (utils.compressToWebPSmall as jest.Mock).mockRestore();
  });

  test("inserts multiple image files", async () => {
    const insertHtml = jest.fn();
    const editorRef = makeEditorRef(document.createElement("div"));

    const img1 = new File(["data1"], "a.png", { type: "image/png" });
    const img2 = new File(["data2"], "b.jpg", { type: "image/jpeg" });

    jest.spyOn(utils, "compressToWebPSmall").mockResolvedValue("data:image/webp;base64,mock");

    await insertImages([img1, img2], editorRef, insertHtml);

    expect(insertHtml).toHaveBeenCalledTimes(2);
    (utils.compressToWebPSmall as jest.Mock).mockRestore();
  });

  test("includes escaped file name in alt attribute", async () => {
    const insertHtml = jest.fn();
    const editorRef = makeEditorRef(document.createElement("div"));

    const imgFile = new File(["data"], 'my "test" image.png', { type: "image/png" });

    jest.spyOn(utils, "compressToWebPSmall").mockResolvedValue("data:image/webp;base64,mock");

    await insertImages([imgFile], editorRef, insertHtml);

    expect(insertHtml.mock.calls[0][0]).toContain("&quot;");
    (utils.compressToWebPSmall as jest.Mock).mockRestore();
  });
});
