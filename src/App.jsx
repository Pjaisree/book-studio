
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

// 1. Navbar
function Navbar({ isAdmin, onLogin, onLogout }) {
  return (
    <nav className="navbar">
      <h2 className="logo">
        bookz<span>.</span>
      </h2>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#featured">Explore</a>
        <a href="#featured">Categories</a>
        <a href="#featured">Membership</a>
      </div>

      {isAdmin ? (
        <div className="admin-actions">
          <span className="admin-label">Admin</span>
          <button className="login-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <button className="login-btn" onClick={onLogin}>
          Sign In
        </button>
      )}
    </nav>
  );
}

// 2. Hero
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="hero-tagline">YOUR NEXT CHAPTER STARTS HERE</p>

        <h1>
          Discover Books.
          <br />
          Discover <span>Possibilities.</span>
        </h1>

        <p>
          Explore a world of stories, knowledge and inspiration.
          Find your next favourite book with Bookz Studio.
        </p>

        <div className="hero-buttons">
          <a href="#featured" className="primary-btn">
            Explore Books
          </a>
          <a href="#featured" className="secondary-btn">
            Browse Collection
          </a>
        </div>
      </div>
    </section>
  );
}

// 3. Admin Login Modal
function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
  }

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal-heading">
          <p>BOOKZ STUDIO</p>
          <h2>Admin Login</h2>
          <span>Sign in to manage your book collection.</span>
        </div>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button
            className="modal-login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 4. Add and Edit Book Modal
function BookFormModal({ book, onClose, onSaved }) {
  const isEditing = Boolean(book);

  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [price, setPrice] = useState(book ? String(book.price) : "");
  const [category, setCategory] = useState(book?.category || "Fiction");
  const [imageUrl, setImageUrl] = useState(book?.image || "");
  const [description, setDescription] = useState(
    book?.description || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setLoading(true);

    const bookDetails = {
      title: title.trim(),
      author: author.trim(),
      price: numericPrice,
      category,
      image_url: imageUrl.trim() || null,
      description: description.trim() || null,
    };

    let result;

    if (isEditing) {
      result = await supabase
        .from("books")
        .update(bookDetails)
        .eq("id", book.id);
    } else {
      result = await supabase
        .from("books")
        .insert([bookDetails]);
    }

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <div className="login-modal-overlay">
      <div className="login-modal add-book-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal-heading">
          <p>BOOKZ STUDIO</p>
          <h2>{isEditing ? "Edit Book" : "Add New Book"}</h2>
          <span>
            {isEditing
              ? "Update the details of this book."
              : "Enter the details of the new book."}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Book Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
            required
          />

          <label>Author</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
            required
          />

          <label>Price (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            required
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Fiction</option>
            <option>Self-Help</option>
            <option>Business</option>
          </select>

          <label>Book Cover Image URL (Optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL"
          />

          <label>Book Description (Optional)</label>
          <textarea
            className="book-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description about the book..."
            rows="5"
          />

          {error && <p className="login-error">{error}</p>}

          <button
            className="modal-login-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add Book"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 5. Delete Book Confirmation Modal
function DeleteBookModal({ book, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("books")
      .delete()
      .eq("id", book.id);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    onDeleted();
    onClose();
  }

  return (
    <div className="login-modal-overlay">
      <div className="login-modal delete-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal-heading">
          <p>BOOKZ STUDIO</p>
          <h2>Delete Book?</h2>
          <span>
            Are you sure you want to delete{" "}
            <strong>{book.title}</strong>?
            This action cannot be undone.
          </span>
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="delete-actions">
          <button
            className="cancel-delete-btn"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="confirm-delete-btn"
            type="button"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 6. Book Details Modal
function BookDetailsModal({ book, onClose }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="login-modal-overlay">
      <div className="login-modal book-details-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="book-details-content">
          <div className="book-details-cover">
            {!imageFailed && book.image ? (
              <img
                src={book.image}
                alt={book.title}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="image-fallback">
                <span>📚</span>
                <p>Cover unavailable</p>
              </div>
            )}
          </div>

          <div className="book-details-info">
            <p className="details-label">BOOK DETAILS</p>
            <span className="book-category">{book.category}</span>

            <h2>{book.title}</h2>
            <p className="details-author">By {book.author}</p>

            <h3 className="details-price">₹{book.price}</h3>

            <div className="details-divider" />

            <h4>About this book</h4>
            <p className="details-description">
              {book.description?.trim() ||
                "Description coming soon."}
            </p>

            <button
              className="modal-login-btn details-close-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. Book Card
function BookCard({
  book,
  isAdmin,
  onEdit,
  onDelete,
  onViewDetails,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="book-card">
      <div className="book-cover">
        {!imageFailed && book.image ? (
          <img
            src={book.image}
            alt={book.title}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="image-fallback">
            <span>📚</span>
            <p>Cover unavailable</p>
          </div>
        )}
      </div>

      <span className="book-category">{book.category}</span>
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <h4>₹{book.price}</h4>

      <button
        className="view-btn"
        onClick={() => onViewDetails(book)}
      >
        View Details
      </button>

      {isAdmin && (
        <div className="book-admin-actions">
          <button
            className="edit-book-btn"
            onClick={() => onEdit(book)}
          >
            Edit Book
          </button>

          <button
            className="delete-book-btn"
            onClick={() => onDelete(book)}
          >
            Delete Book
          </button>
        </div>
      )}
    </div>
  );
}

// 8. Featured Books
function FeaturedBooks({
  isAdmin,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onViewDetails,
  refreshKey,
}) {
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setBooks(
          data.map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            category: book.category,
            image: book.image_url,
            description: book.description || "",
          }))
        );
      }

      setLoading(false);
    }

    fetchBooks();
  }, [refreshKey]);

  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === "All" ||
      book.category === selectedCategory;

    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="featured-section" id="featured">
      <div className="section-heading">
        <p>OUR COLLECTION</p>
        <h2>Featured Books</h2>

        {isAdmin && (
          <button className="add-book-btn" onClick={onAddBook}>
            + Add New Book
          </button>
        )}
      </div>

      <div className="category-list">
        {["All", "Fiction", "Self-Help", "Business"].map(
          (category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          )
        )}
      </div>

      <input
        type="text"
        className="book-search"
        placeholder="Search by book title or author..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="books-grid">
        {loading ? (
          <p>Loading books...</p>
        ) : error ? (
          <p className="no-books">Unable to load books: {error}</p>
        ) : filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isAdmin={isAdmin}
              onEdit={onEditBook}
              onDelete={onDeleteBook}
              onViewDetails={onViewDetails}
            />
          ))
        ) : (
          <p className="no-books">
            No books found. Try another search.
          </p>
        )}
      </div>
    </section>
  );
}

// 9. Main App
function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (active) {
        setIsAdmin(!error && !!data);
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [session]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    }
  }

  function openEditForm(book) {
    setEditingBook(book);
    setBookFormOpen(true);
  }

  function openAddForm() {
    setEditingBook(null);
    setBookFormOpen(true);
  }

  function closeBookForm() {
    setBookFormOpen(false);
    setEditingBook(null);
  }

  function refreshBooks() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <div>
      <Navbar
        isAdmin={isAdmin}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
      />

      <Hero />

      <FeaturedBooks
        isAdmin={isAdmin}
        onAddBook={openAddForm}
        onEditBook={openEditForm}
        onDeleteBook={setDeletingBook}
        onViewDetails={setSelectedBook}
        refreshKey={refreshKey}
      />

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} />
      )}

      {bookFormOpen && isAdmin && (
        <BookFormModal
          book={editingBook}
          onClose={closeBookForm}
          onSaved={refreshBooks}
        />
      )}

      {deletingBook && isAdmin && (
        <DeleteBookModal
          book={deletingBook}
          onClose={() => setDeletingBook(null)}
          onDeleted={refreshBooks}
        />
      )}

      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}

export default App;
