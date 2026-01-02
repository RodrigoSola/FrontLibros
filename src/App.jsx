import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import './App.css';
 const API_URL = import.meta.env.VITE_API_URL || 'https://backlibros.onrender.com/api/books';

export default function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
const sorted = filtered.sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
    } else {
      return a.author.localeCompare(b.author, 'es', { sensitivity: 'base' });
    }
  });
    setFilteredBooks(sorted);
  }, [searchTerm, books, sortBy]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get`);
      const data = await response.json();
      setBooks(data.books || []);
      setError('');
    } catch (err) {
      setError('Error al cargar los libros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author) {
      setError('Título y autor son requeridos');
      return;
    }

    try {
      setLoading(true);
      const url = editingBook 
        ? `${API_URL}/update/${editingBook._id}`
        : `${API_URL}/create`;
      
      const method = editingBook ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          price: Number(formData.price) || 0,
          stock: Number(formData.stock) || 0
        })
      });

      if (response.ok) {
        await fetchBooks();
        handleCloseForm();
        setError('');
      } else {
        setError('Error al guardar el libro');
      }
    } catch (err) {
      setError('Error al guardar el libro');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price || '',
      stock: book.stock || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este libro?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchBooks();
        setError('');
      } else {
        setError('Error al eliminar el libro');
      }
    } catch (err) {
      setError('Error al eliminar el libro');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      price: '',
      stock: ''
    });
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>📚Administracion de Libros </h1>
        <p>Sistema de administración de inventario</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
    <button  className="btn-primary" onClick={() => setSortBy('title')}>Ordenar por Título</button>
    <button className="btn-primary" onClick={() => setSortBy('author')}>Ordenar por Autor</button>
  </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Nuevo Libro
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBook ? 'Editar Libro' : 'Nuevo Libro'}</h2>
              <button onClick={handleCloseForm} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Autor *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="1"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  <Save size={20} />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showForm ? (
        <div className="loading">Cargando...</div>
      ) : (
        <div className="books-grid">
          {filteredBooks.length === 0 ? (
            <div className="no-books">
              <p>No se encontraron libros</p>
            </div>
          ) : (
            filteredBooks.map(book => (
              <div key={book._id} className="book-card">
                <div className="book-header">
                  <h3>{book.title}</h3>
                  <div className="book-actions">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(book)}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(book._id)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="book-body">
                  <p className="book-author">
                    <strong>Autor:</strong> {book.author}
                  </p>
                  <div className="book-info">
                    <div className="info-item">
                      <span className="label">Precio:</span>
                      <span className="value price">${book.price || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Stock:</span>
                      <span className={`value stock ${book.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {book.stock || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      
    </div>
  );
}


