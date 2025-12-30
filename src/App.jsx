import { useState, useEffect, useMemo } from 'react'
import './assets/style.css'

function App() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'asc' })

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        return response.json()
      })
      .then(data => {
        setCoins(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredCoins = useMemo(() => {
    return coins.filter(coin =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
    )
  }, [coins, search])

  const sortedCoins = useMemo(() => {
    let sortableCoins = [...filteredCoins]
    if (sortConfig.key) {
      sortableCoins.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
        if (aValue == null) aValue = 0
        if (bValue == null) bValue = 0
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableCoins
  }, [filteredCoins, sortConfig])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="App">
      <header>
        <h1>Cryptocurrency Tracker</h1>
        <input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </header>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('market_cap_rank')} style={{cursor: 'pointer'}}>
                Rank {sortConfig.key === 'market_cap_rank' && <span className="sort-icon">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
              </th>
              <th onClick={() => requestSort('name')} style={{cursor: 'pointer'}}>
                Name {sortConfig.key === 'name' && <span className="sort-icon">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
              </th>
              <th onClick={() => requestSort('current_price')} style={{cursor: 'pointer'}}>
                Price {sortConfig.key === 'current_price' && <span className="sort-icon">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
              </th>
              <th onClick={() => requestSort('price_change_percentage_24h')} style={{cursor: 'pointer'}}>
                24h Change {sortConfig.key === 'price_change_percentage_24h' && <span className="sort-icon">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
              </th>
              <th onClick={() => requestSort('market_cap')} style={{cursor: 'pointer'}}>
                Market Cap {sortConfig.key === 'market_cap' && <span className="sort-icon">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCoins.map(coin => (
              <tr key={coin.id}>
                <td>{coin.market_cap_rank}</td>
                <td className="name-cell">
                  <img src={coin.image} alt={coin.name} className="coin-icon" />
                  {coin.name} ({coin.symbol.toUpperCase()})
                </td>
                <td>${coin.current_price.toLocaleString()}</td>
                <td className={coin.price_change_percentage_24h !== null ? (coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative') : ''}>
                  {coin.price_change_percentage_24h !== null ? coin.price_change_percentage_24h.toFixed(2) + '%' : 'N/A'}
                </td>
                <td>${coin.market_cap.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer>
        © 2024 <a href="https://heneral.github.io/portfolio/" target="_blank" rel="noopener noreferrer">richardsawanaka</a>
      </footer>
    </div>
  )
}

export default App
