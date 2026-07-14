import { useState, useRef, useCallback, type ChangeEvent } from 'react'
import './App.css'
import useBookSearch from './customHooks/useBookSearch'

function App() {
  const observer = useRef<IntersectionObserver | null>(null)
  const [querry, setquerry] = useState('')
  const [pageNumber, setpageNumber] = useState(1)
  const { loading, error, books, hasMore } = useBookSearch(querry, pageNumber)

  const lastbookReference = useCallback((node: Element | null) => {
    if (loading) return
    if (observer) observer.current?.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setpageNumber((prev) => prev + 1)
        console.log('visible')
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setquerry(e.target.value)
    setpageNumber(1)
  }

  return (
    <main className='library-app'>
      <div className='page-shell'>
        <nav className='nav'>
          <div className='brand'><span className='brand-mark'>B</span>Boundless</div>
          <span className='nav-note'>An endless reading shelf</span>
        </nav>

        <section className='hero'>
          <p className='eyebrow'>Open your next chapter</p>
          <h1>A library with <em>no last page.</em></h1>
          <p className='hero-copy'>Type a title, follow your curiosity, and let the shelf keep unfolding beneath you.</p>
          <label className='search-box'>
            <span className='search-icon' aria-hidden='true'>⌕</span>
            <input type='text' value={querry} placeholder='Search books, stories, ideas...' aria-label='Search books' onChange={handleSearch} />
            <span className='search-key'>SEARCH</span>
          </label>
        </section>

        <section aria-label='Book results'>
          <div className='collection-head'>
            <div>
              <h2>{querry ? `Results for “${querry}”` : 'Fresh from the stacks'}</h2>
              <p>{books.length ? `${books.length} titles collected so far` : 'Your reading trail starts here.'}</p>
            </div>
            <span className='scroll-status'>Keep scrolling ↓</span>
          </div>

          <div className='book-grid'>
            {books.map((book, index) => {
              const card = (
                <article className='book-card'>
                  {book.coverUrl && (
                    <img
                      className='book-cover'
                      src={book.coverUrl}
                      alt={`Cover of ${book.title}`}
                      onError={(event) => { event.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <div className='cover-shade' />
                  <p className='book-number'>VOL. {String(index + 1).padStart(2, '0')}</p>
                  <h3>{book.title}</h3>
                  <div className='book-footer'><span>Open book</span><span aria-hidden='true'>↗</span></div>
                </article>
              )

              if (index === books.length - 1) return <div key={book.title} ref={lastbookReference}>{card}</div>
              return <div key={book.title}>{card}</div>
            })}
          </div>
          <div className='load-state'>
            {loading && <span className='loading'>Finding more stories</span>}
            {error && <span className='error'>Something went wrong. Please try again.</span>}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
