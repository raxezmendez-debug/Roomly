// ---------------------------------------------
// BLOQUE 1: IMPORTS Y CONEXIÓN CON REACT/CSS
// ---------------------------------------------
// Importa el hook useState de React para poder guardar el mes y el año del calendario.
// Importa el archivo App.css para conectar este componente con sus estilos visuales.
import { useState } from "react";
import "./App.css";

// ---------------------------------------------
// BLOQUE 2: COMPONENTE PRINCIPAL
// ---------------------------------------------
// Este componente App devuelve la interfaz del calendario de reservas de Roomly.
// React lo renderiza en la pantalla principal de la aplicación.
function App() {

  // -------------------------------------------
  // BLOQUE 3: FECHA ACTUAL DEL SISTEMA
  // -------------------------------------------
  // Crea un objeto Date con la fecha actual del PC o navegador.
  // Se usa para saber qué día, mes y año son hoy.
  const hoy = new Date();

  // -------------------------------------------
  // BLOQUE 4: ESTADO DEL CALENDARIO
  // -------------------------------------------
  // useState guarda información que puede cambiar en tiempo real y hace que React vuelva a renderizar.
  // mes: guarda el mes actual mostrado en el calendario.
  // setMes: cambia ese valor cuando el usuario navega entre meses.
  // año: guarda el año actual mostrado.
  // setAño: cambia el año cuando se avanza o retrocede el calendario.
  const [mes, setMes] = useState(hoy.getMonth());
  const [año, setAño] = useState(hoy.getFullYear());

  // -------------------------------------------
  // BLOQUE 5: NOMBRES DE LOS MESES
  // -------------------------------------------
  // Este arreglo guarda los nombres de los meses en español.
  // Se usa luego para mostrar el título del mes en pantalla, por ejemplo: "Agosto 2026".
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // -------------------------------------------
  // BLOQUE 6: NOMBRES DE LOS DÍAS
  // -------------------------------------------
  // Este arreglo guarda los nombres cortos de los días de la semana.
  // Se usa para dibujar la cabecera del calendario: DOM, LUN, MAR, etc.
  const nombresDias = [
    "DOM",
    "LUN",
    "MAR",
    "MIÉ",
    "JUE",
    "VIE",
    "SÁB",
  ];

  // -------------------------------------------
  // BLOQUE 7: FUNCIONES PARA MOVERSE ENTRE MESES
  // -------------------------------------------
  // cambiarMes recibe la dirección del movimiento.
  // direccion = 1 -> mes siguiente
  // direccion = -1 -> mes anterior
  const cambiarMes = (direccion) => {
    // Calcula el mes nuevo a partir del estado actual.
    let nuevoMes = mes + direccion;
    // Guarda el año actual para modificarlo si hace falta.
    let nuevoAño = año;

    // Si el mes pasa de diciembre, vuelve a enero y sube un año.
    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAño++;
    }

    // Si el mes baja de enero, va a diciembre y resta un año.
    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAño--;
    }

    // Actualiza el estado del mes y del año.
    // Cuando cambia el estado, React vuelve a renderizar el componente.
    setMes(nuevoMes);
    setAño(nuevoAño);
  };

  // -------------------------------------------
  // BLOQUE 8: VOLVER AL DÍA DE HOY
  // -------------------------------------------
  // Esta función reinicia el calendario al mes y año reales actuales.
  const irAHoy = () => {
    setMes(hoy.getMonth());
    setAño(hoy.getFullYear());
  };

  // -------------------------------------------
  // BLOQUE 9: CÁLCULO DE DÍAS DEL MES Y PRIMER DÍA
  // -------------------------------------------
  // Obtiene la cantidad total de días del mes actual.
  // new Date(año, mes + 1, 0) devuelve el último día del mes anterior.
  // .getDate() devuelve ese número.
  const diasDelMes = new Date(año, mes + 1, 0).getDate();

  // Obtiene el día de la semana en que empieza el mes actual.
  // getDay() devuelve 0=domingo, 1=lunes, ..., 6=sábado.
  const primerDia = new Date(año, mes, 1).getDay();

  // -------------------------------------------
  // BLOQUE 10: CREAR LOS DÍAS DEL CALENDARIO
  // -------------------------------------------
  // Este arreglo va a guardar todos los días que se muestran en pantalla.
  // También incluirá posiciones vacías para alinear el calendario correctamente.
  const dias = [];

  // Agrega espacios vacíos al inicio para que el primer día del mes quede en la columna correcta.
  for (let i = 0; i < primerDia; i++) {
    dias.push(null);
  }

  // Agrega todos los días del mes actual al arreglo.
  for (let dia = 1; dia <= diasDelMes; dia++) {
    dias.push(dia);
  }

  // -------------------------------------------
  // BLOQUE 11: FUNCIONES DE COMPARACIÓN
  // -------------------------------------------
  // esHoy verifica si un número de día coincide con la fecha actual.
  const esHoy = (dia) => {
    return (
      dia === hoy.getDate() &&
      mes === hoy.getMonth() &&
      año === hoy.getFullYear()
    );
  };

  // esPasado verifica si una fecha ya ocurrió antes que hoy.
  const esPasado = (dia) => {
    // Si no hay día, significa que es un espacio vacío del calendario.
    if (!dia) return false;

    // Crea una fecha exacta del día actual que se está revisando.
    const fecha = new Date(año, mes, dia);
    // Crea una fecha con la fecha real de hoy.
    const fechaHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );

    // Devuelve true si la fecha del calendario es menor que hoy.
    return fecha < fechaHoy;
  };

  // -------------------------------------------
  // BLOQUE 12: RETORNO DEL JSX (INTERFAZ)
  // -------------------------------------------
  // Aquí se devuelve el HTML que verá el usuario.
  return (
    <div className="roomly">

      <header className="header">

        <div>
          <div className="logo">Roomly</div>
          <div className="subtitle">Gestión de reservas</div>
        </div>

        <button className="new-reservation">
          + Nueva reserva
        </button>

      </header>

      <main className="calendar-container">

        <div className="calendar-header">

          {/* Botón para regresar al mes anterior */}
          <button onClick={() => cambiarMes(-1)}>
            ‹
          </button>

          {/* Muestra el nombre del mes y el año actual en pantalla */}
          <h2>
            {nombresMeses[mes]} {año}
          </h2>

          {/* Botón para avanzar al siguiente mes */}
          <button onClick={() => cambiarMes(1)}>
            ›
          </button>

        </div>

        {/* Botón que vuelve a la fecha real actual */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button onClick={irAHoy}>
            Hoy
          </button>
        </div>

        <div className="calendar">

          {/* Recorre el arreglo de días de la semana y dibuja cada nombre */}
          {nombresDias.map((dia) => (
            <div className="day" key={dia}>
              <strong>{dia}</strong>
            </div>
          ))}

          {/* Recorre el arreglo con todos los días del calendario y los dibuja */}
          {dias.map((dia, indice) => (

            <div
              key={indice}
              className={
                "day " +
                (esHoy(dia) ? "today " : "") +
                (esPasado(dia) ? "past" : "")
              }
            >

              {/* Si el valor existe, muestra el número del día */}
              {dia && (
                <>
                  <span>{dia}</span>

                  {/* Si ese día es hoy, agrega la etiqueta HOY */}
                  {esHoy(dia) && (
                    <div>
                      <strong>HOY</strong>
                    </div>
                  )}
                </>
              )}

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

// -------------------------------------------
// BLOQUE 13: EXPORTACIÓN FINAL
// -------------------------------------------
// Exporta el componente para que pueda ser usado desde main.jsx.
export default App;