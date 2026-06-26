import React from "react";
export declare function saveNotesToFile(notes: any[], articles: any[], fileHandleRef: React.MutableRefObject<any | null>): Promise<void>;
export declare function loadNotesFromFile(fileHandleRef: React.MutableRefObject<any | null>, replaceAllNotes: (entries: any[]) => void, replaceAllArticles: (entries: any[]) => void): Promise<void>;
//# sourceMappingURL=notesFileIO.d.ts.map