

As a user i want to be able to open a tab and write an article that is not linked to a book and chapter. 

when a new tab is opened a new component "HomeTab" should be shown so the user can select from the following options:
- open a bible book and chapter
- create a new article that is not linked to a book and chapter (ask for an id/hashtag)
- open an article

Change the context so articles can be stored and managed separately from notes linked to a book and chapter. 
articles are stored and found using the id/hashtag provided by the user when creating a new article.

When the user selects "create a new article that is not linked to a book and chapter", 
the TabState should be set to "article" and the note editor should be blank.

Create a new tab called "Articles" that opens a blank note editor for new articles.
The user should be able to write and save the article just like they would with a note linked to a book and chapter.

when a user selects "open an article", they should be selected from a list of existing articles (displayed in the HomeTab)
and upon selection, the TabState should be set to "article" and the note editor should load the content of the selected article 
for editing.

when users saves the data to file the articles should be saved in the same manner (data block) and the same file.

