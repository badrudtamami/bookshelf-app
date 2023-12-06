const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "save-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const spanSubmitForm = document.querySelector("#inputBook span");
  const completeCheckbox = document.getElementById("inputBookIsComplete");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  completeCheckbox.addEventListener("change", function () {
    spanSubmitForm.innerText = "";
    if (this.checked) {
      spanSubmitForm.innerText = "Selesai dibaca";
    } else {
      spanSubmitForm.innerText = "Belum selesai dibaca";
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isCompleted = document.getElementById("inputBookIsComplete").checked;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    title,
    author,
    year,
    isCompleted
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById(
    "uncompleteBookshelfList"
  );
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `penulis: ${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const btnRead = document.createElement("button");
  btnRead.classList.add("btn-read");

  if (bookObject.isCompleted) {
    btnRead.innerText = "Belum dibaca";

    btnRead.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });
  } else {
    btnRead.innerText = "Selesai dibaca";

    btnRead.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });
  }

  const btnDelete = document.createElement("button");
  btnDelete.classList.add("btn-delete");
  btnDelete.innerText = "Hapus";

  btnDelete.addEventListener("click", function () {
    const modalDelete = document.getElementById("modalDelete");
    modalDelete.setAttribute("style", "display:block");
    const btnHapus = document.getElementById("btnHapus");
    btnHapus.addEventListener("click", function () {
      deleteBookFromList(bookObject.id);
      modalDelete.setAttribute("style", "display:none");
    });
  });

  const btnEdit = document.createElement("button");
  btnEdit.classList.add("btn-edit");
  btnEdit.innerText = "Edit";

  btnEdit.addEventListener("click", function () {
    const modalEdit = document.getElementById("modalEdit");
    modalEdit.setAttribute("style", "display:grid");
    const textEditTitle = document.getElementById("inputEditTitle");
    const textEditAuthor = document.getElementById("inputEditAuthor");
    const textEditYear = document.getElementById("inputEditYear");
    const textEditIsCompleted = document.getElementById("inputEditIsCompleted");

    const bookId = this.closest(".book-item").id;
    const bookItem = findBook(Number(bookId));

    textEditTitle.value = bookItem.title;
    textEditAuthor.value = bookItem.author;
    textEditYear.value = bookItem.year;
    textEditIsCompleted.checked = bookItem.isCompleted;

    const submitFormEdit = document.getElementById("editBook");
    submitFormEdit.addEventListener("submit", function (event) {
      event.preventDefault();
      editBook(bookId);
      modalEdit.setAttribute("style", "display:none");
    });
  });

  const container = document.createElement("article");
  container.classList.add("book-item");
  container.append(
    textTitle,
    textAuthor,
    textYear,
    btnRead,
    btnDelete,
    btnEdit
  );
  container.setAttribute("id", `${bookObject.id}`);

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("action");
  btnContainer.append(btnRead, btnDelete, btnEdit);

  container.append(btnContainer);

  return container;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function deleteBookFromList(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchInput = document.getElementById("btn-search");

searchInput.addEventListener("click", function (event) {
  const searchBook = document.getElementById("searchBookTitle").value;
  const bookList = document.querySelectorAll("article");
  for (titleBook of bookList) {
    if (
      titleBook.childNodes[0].innerText
        .toLowerCase()
        .includes(searchBook.toLowerCase())
    ) {
      titleBook.setAttribute("style", "display:block;");
    } else {
      titleBook.setAttribute("style", "display:none;");
    }
  }

  event.preventDefault();
});

const btnShowForm = document.querySelector(".btnShowForm");
const formBook = document.getElementById("inputBook");
btnShowForm.addEventListener("click", function () {
  if (formBook.style.display === "none") {
    formBook.setAttribute("style", "display:grid");
  } else {
    formBook.setAttribute("style", "display:none");
  }
});

function editBook(bookId) {
  const bookTarget = findBook(Number(bookId));
  if (bookTarget == null) return;

  const editTitle = document.getElementById("inputEditTitle").value;
  const editAuthor = document.getElementById("inputEditAuthor").value;
  const editYear = document.getElementById("inputEditYear").value;
  const editIsCompleted = document.getElementById(
    "inputEditIsCompleted"
  ).checked;

  bookTarget.title = editTitle;
  bookTarget.author = editAuthor;
  bookTarget.year = editYear;
  bookTarget.isCompleted = editIsCompleted;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
