import './App.css'

function App() {
  return (
    <div className="roomly">
      <header className="header">
        <h1>Roomly</h1>

        <button className="new-reservation">
          + Nueva reserva
        </button>
      </header>

      <main className="calendar-container">

        <div className="calendar-header">
          <button>‹</button>

          <h2>Agosto 2026</h2>

          <button>›</button>
        </div>

        <div className="calendar">

          <div className="day">
            <strong>LUN</strong>
            <span>10</span>
          </div>

          <div className="day">
            <strong>MAR</strong>
            <span>11</span>
          </div>

          <div className="day">
            <strong>MIÉ</strong>
            <span>12</span>
          </div>

          <div className="day">
            <strong>JUE</strong>
            <span>13</span>
          </div>

          <div className="day">
            <strong>VIE</strong>
            <span>14</span>
          </div>

          <div className="day">
            <strong>SÁB</strong>
            <span>15</span>
          </div>

          <div className="day">
            <strong>DOM</strong>
            <span>16</span>
          </div>

        </div>

      </main>
    </div>
  )
}

export default App