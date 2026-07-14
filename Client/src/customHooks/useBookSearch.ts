import { useEffect, useState } from 'react'
import axios from "axios"

export type Book = {
    title: string
    coverUrl?: string
}

type SearchDocument = {
    title?: string
    cover_i?: number
}

export default function useBookSearch(querry: string, pageNumber: number) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [books, setBooks] = useState<Book[]>([])
    const [hasMore, setHasMore] = useState(false)
    
    useEffect(() => { setBooks([]) }, [querry])
    useEffect(() => {
        setLoading(true)
        setError(false)
        let cancel: (() => void) | undefined
        axios({
            method: "GET",
            url: 'https://openlibrary.org/search.json',
            params: { q: querry, page: pageNumber },
            cancelToken: new axios.CancelToken(ct => cancel = ct)
        }).then(res => {
            console.log(res.data.docs)
            const docs: SearchDocument[] = res.data?.docs ?? []
            const nextBooks = docs
                .filter((book) => Boolean(book.title))
                .map((book) => ({
                    title: book.title!,
                    coverUrl: book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg?default=false`
                        : undefined
                }))

            setBooks(previous => {
                return [...new Map([...previous, ...nextBooks].map((book) => [book.title, book])).values()]
            })
            setHasMore(docs.length > 0)
            setLoading(false)

        }).catch(e => {
            if (axios.isCancel(e)) return
            setError(true)
        })
        return () => cancel?.()
    }, [querry, pageNumber])
    return { loading, error, books, hasMore }
}
