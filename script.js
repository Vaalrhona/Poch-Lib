$(document).ready(function(){
    if(sessionStorage.getItem('books')){
        var books = JSON.parse(sessionStorage.getItem('books'));
        books.forEach(element => {
            getPreviousBook(element);
        });
    }
    var searchResults = document.createElement('div');
    searchResults.id = 'results';

    init();

    $('form').submit(getBooks());
    $('hr').after(searchResults);
    $('#searchDiv').hide();
    $('#addBook').click(function(){
        $('#searchDiv').slideDown();
        $('#addBook').fadeTo(100, 0);
        $('#cancel').width($('#submitButton').width());
      });
    $('#cancel').click(function(){
        $('#searchDiv').slideUp();
        $('#addBook').fadeTo(100, 1);
        $('#results').slideUp();
        $('#content').find('#resultsHR').remove();
        history.pushState(null, "", location.href.split("?")[0]); //thanks stack overflow
    });
    var bookCollection = document.createElement('div');
    bookCollection.id = 'collection';
    bookCollection.classList = 'bookCollection';
    $('#content').append(bookCollection);
});

    function init(){
        var newBookDiv = document.getElementById('myBooks');
        var addBookButton = createButton('Ajouter un livre', 'addBook');
        var searchDiv = document.createElement('div');
        searchDiv.id = 'searchDiv';
        var formDiv = getForm();
        var cancelButton = createButton('Annuler', 'cancel');
        cancelButton.classList = 'formButtons';
        searchDiv.append(formDiv);
        searchDiv.append(cancelButton);
        newBookDiv.insertBefore(searchDiv, newBookDiv.childNodes[5]);
        newBookDiv.insertBefore(addBookButton, newBookDiv.childNodes[4]);
    }
    function getForm(){
        var formDiv = document.createElement('form');
        formDiv.method = 'get';
        formDiv.id = 'formDiv';
        formDiv.append(createInputField('bookTitle', 'Titre du livre'));
        formDiv.append(createInputField('authorName', 'Auteur'));
        formDiv.append(createSubmitButton());
        return formDiv;
    }

    function createButton(name, id){
        var button = document.createElement('button');
        button.id = id;
        button.innerHTML = name;
        return button;
    }

    function createInputField(id, label){
        var inputDiv = document.createElement('div');
        inputDiv.classList.add('form','searchInput');
        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.name = id;
        inputField.required = true;

        var inputLabel = document.createElement('label');
        inputLabel.setAttribute('for', id);
        inputLabel.innerHTML = label;

        inputDiv.append(inputLabel);
        inputDiv.append(inputField);

        return inputDiv;
    }

    function createSubmitButton(){
        var submitButton = createButton('Rechercher', 'submitButton')
        submitButton.type = 'submit';
        return submitButton;
    }
    function getBooks(){
        $('#results').empty();
        var search = new URLSearchParams(window.location.search);
        var authorName = search.get('authorName');
        var bookTitle = search.get('bookTitle');
        var googleAPI = 'https://www.googleapis.com/books/v1/volumes?q='+bookTitle+'+'+authorName;
        if(authorName!=null&&bookTitle!=null){
            $.getJSON(googleAPI, function (response) {
                if(response.items!=undefined){
                    for (var i = 0; i < response.items.length; i++) {
                        var item = response.items[i];
                        renderBook(item, true);
                    }
                    
                    $('#addBook').hide();
                    $('#searchDiv').show();
                    var searchResultTitle = document.createElement('h2');
                    searchResultTitle.innerHTML = 'Résultats de recherche';
                    $('#results').prepend(searchResultTitle);
                    var resultsHR = document.createElement('hr');
                    resultsHR.setAttribute('id', 'resultsHR');
                    $('#content').prepend(resultsHR);
                }
                else {
                    alert('Aucun livre n\'a été trouvé');
                }
            });
        }
    }

    function saveBook(book){
        if (storageAvailable('sessionStorage')) {
            var books = (sessionStorage.getItem('books')!=null)?JSON.parse(sessionStorage.getItem('books')):[];
            if(books!=null&&!books.includes(book)){
                books.push(book);
                $('#'+book+'div').clone(true, true).appendTo($('#collection'));
                $('#collection').find('#'+book+'div').find('#'+book).addClass('bookmark far fa-trash-alt');
                document.getElementById(book).classList = 'bookmark far fa-trash-alt';
            }
            else{
                var index = books.indexOf(book);
                books.splice(index, 1);
                $('#collection').find('#'+book+'div').remove();
                if(document.getElementById(book)){
                    document.getElementById(book).classList = 'bookmark fas fa-bookmark';
                }
            }
            sessionStorage.setItem('books', JSON.stringify(books));
        }
        else {
            alert('Malheureusement, la sauvegarde de livres est indisponible pour le moment...');
        }
    }

    function renderBook(item, isNew){
        var books = JSON.parse(sessionStorage.getItem('books'));
        if(item!=undefined){
            var bookDiv = document.createElement('div');
            bookDiv.classList = 'book';
            bookDiv.id = item.id+'div';

            var bookMarkContainer = document.createElement('span');
            bookMarkContainer.id = item.id+'container';
            bookMarkContainer.setAttribute('onclick', 'saveBook("'+item.id+'")');
            var bookMark = document.createElement('i');
            bookMark.id = item.id;
            bookMark.classList = (books!=null&&books.includes(item.id))?'bookmark far fa-trash-alt':'bookmark fas fa-bookmark';
            bookMarkContainer.append(bookMark);
            bookDiv.append(bookMarkContainer);

            var title = document.createElement('p');
            title.classList = 'bookTitle';
            var bookName = (item.volumeInfo.title.length>50)?item.volumeInfo.title.substring(0,50)+'...':item.volumeInfo.title;
            title.innerHTML = 'Titre : '+bookName;
            bookDiv.append(title);

            var id = document.createElement('p');
            id.classList = 'bookId'
            id.innerHTML = 'Id : '+item.id;
            bookDiv.append(id);

            var author = document.createElement('p');
            author.classList = 'bookAuthor';
            var authorName = item.volumeInfo.authors;
            author.innerHTML = 'Auteur : '+authorName;
            bookDiv.append(author);

            var description = document.createElement('p');
            description.classList = 'bookDescription';
            var descriptionInfo = (item.volumeInfo.description!=undefined)?item.volumeInfo.description:'Information manquante';
            description.innerHTML = (descriptionInfo.length>=200)?descriptionInfo.substring(0,200)+'...':descriptionInfo;
            bookDiv.append(description);

            var thumbnail = document.createElement('img');
            thumbnail.classList = 'bookThumbnail';
            thumbnail.src = (item.volumeInfo.imageLinks!=undefined)?item.volumeInfo.imageLinks.thumbnail:'unavailable.png';
            bookDiv.append(thumbnail);
            if(isNew==true){
                $('#results').append(bookDiv);
            }
            else{
                $('#collection').append(bookDiv);
            }
        }
    }

    function getPreviousBook(id){
        var googleAPI = 'https://www.googleapis.com/books/v1/volumes/'+id;
        $.getJSON(googleAPI, function (item) {
                    renderBook(item, false);
        })
    }

    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }
    