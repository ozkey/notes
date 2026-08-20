import React from "react";
/**
 * Dialog for inserting or editing a regular link
 */
interface LinkDialogProps {
    show: boolean;
    isEditing: boolean;
    url: string;
    text: string;
    openNewTab: boolean;
    onUrlChange: (url: string) => void;
    onTextChange: (text: string) => void;
    onOpenNewTabChange: (checked: boolean) => void;
    onSubmit: () => void;
    onCancel: () => void;
}
export declare const LinkDialog: React.FC<LinkDialogProps>;
/**
 * Dialog for inserting or editing a Bible bookmark link
 */
interface BibleDialogProps {
    show: boolean;
    isEditing: boolean;
    book: string;
    chapter: string;
    verse: string;
    articleIds: string[];
    articleId: string;
    onBookChange: (book: string) => void;
    onChapterChange: (chapter: string) => void;
    onVerseChange: (verse: string) => void;
    onArticleChange: (articleId: string) => void;
    onInsertArticle: () => void;
    onSubmit: () => void;
    onCancel: () => void;
}
export declare const BibleDialog: React.FC<BibleDialogProps>;
/**
 * Dialog for selecting verses to insert highlight badges
 */
interface HighlightDialogProps {
    show: boolean;
    verses: number[];
    highlightsByVerse: Map<number, string>;
    onSelectVerse: (verseNumber: number, color: string) => void;
    onClose: () => void;
    getColorForHighlight: (color: string) => string;
}
export declare const HighlightDialog: React.FC<HighlightDialogProps>;
export {};
//# sourceMappingURL=dialogs.d.ts.map