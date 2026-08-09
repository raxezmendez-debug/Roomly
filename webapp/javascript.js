// File: javascript.js
// (EN) Core calendar logic: renders the room matrix, fetches reservations
//       from the /ReservaServlet endpoint, and handles UI interactions
//       such as opening modals and drag & drop.
// (ES) Lógica principal del calendario: renderiza la matriz de habitaciones,
//       obtiene las reservas desde el endpoint /ReservaServlet y gestiona la
//       interacción de la UI (modales, arrastrar y soltar).
//
// Mantengo los comentarios en inglés cuando ya existen y añado estas
// explicaciones en español para ayudarte mientras aprendes.

// Configuración de Habitaciones (no hay tabla de habitaciones en la BD, se mantiene local)
        const habitaciones = [
            { id: "DQ(2)", nombre: "DQ(2)", tipo: "Deluxe Queen", estado: "Limpio" },
            { id: "DQ(3)", nombre: "DQ(3)", tipo: "Deluxe Queen", estado: "Limpio" },
            { id: "DQ(4)", nombre: "DQ(4)", tipo: "Deluxe Queen", estado: "Sucia" },
            { id: "DQ(5)", nombre: "DQ(5)", tipo: "Deluxe Queen", estado: "Limpio" },
            { id: "DQ(6)", nombre: "DQ(6)", tipo: "Deluxe Queen", estado: "Mantenimiento" },
            { id: "DQ(7)", nombre: "DQ(7)", tipo: "Deluxe Queen", estado: "Limpio" },
            { id: "DQ(8)", nombre: "DQ(8)", tipo: "Deluxe Queen", estado: "Limpio" },
            { id: "DQ(9)", nombre: "DQ(9)", tipo: "Deluxe Queen", estado: "Sucia" },
            { id: "DQ(10)", nombre: "DQ(10)", tipo: "Deluxe Queen", estado: "Limpio" }
        ];

        // Las reservas ya NO están escritas a mano: se cargan desde MySQL
        // a través de ReservaServlet (ver cargarReservas()).
        let reservas = [];

        const numColumnasDias = 15; // Días visibles con scroll horizontal
        const anchoColumnaPx = 128; // 128px = w-32

        // Primer día visible en la grilla (coincide con el encabezado "FEBRERO 2026", día 12)
        const fechaInicioCalendario = new Date(2026, 1, 12); // mes 1 = Febrero (0-indexado)

        // Renderizar Matrix del Calendario
        function inicializarCalendario() {
            const roomListContainer = document.getElementById("roomList");
            const headerDaysRow = document.getElementById("headerDaysRow");
            const gridMatrixRows = document.getElementById("gridMatrixRows");
            const selectHabitacion = document.getElementById("selectHabitacion");

            roomListContainer.innerHTML = "";
            headerDaysRow.innerHTML = "";
            gridMatrixRows.innerHTML = "";
            selectHabitacion.innerHTML = "";

            // Renderizar la cabecera de días (Del 12 al 26)
            for (let i = 0; i < numColumnasDias; i++) {
                const diaNum = 12 + i;
                const dayHeaderCell = document.createElement("div");
                dayHeaderCell.className = "w-32 border-r border-slate-200 flex flex-col justify-between p-2 shrink-0 text-center select-none";
                dayHeaderCell.innerHTML = `
                    <div class="text-[10px] font-bold text-slate-400 uppercase">FEBRERO</div>
                    <div class="font-bold text-slate-800 text-base">${diaNum}</div>
                    <div class="bg-indigo-50 text-indigo-600 rounded text-[10px] py-0.5 font-bold">94 / $159</div>
                `;
                headerDaysRow.appendChild(dayHeaderCell);
            }

            // Renderizar cada Habitación y su Fila de Celdas
            habitaciones.forEach(hab => {
                // Populate select option
                const opt = document.createElement("option");
                opt.value = hab.id;
                opt.textContent = `${hab.tipo} - ${hab.nombre}`;
                selectHabitacion.appendChild(opt);

                // Sidebar room label
                const roomCell = document.createElement("div");
                roomCell.className = "h-14 px-4 border-b border-slate-200 flex items-center justify-between font-bold text-sm text-slate-700 bg-white";
                roomCell.innerHTML = `
                    <span>${hab.nombre}</span>
                    <span class="text-[10px] font-normal px-2 py-0.5 rounded ${hab.estado === 'Limpio' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${hab.estado}</span>
                `;
                roomListContainer.appendChild(roomCell);

                // Grid Row
                const row = document.createElement("div");
                row.className = "h-14 flex relative shrink-0 min-w-max";
                row.dataset.roomId = hab.id;

                // Crear celdas de días en la fila
                for (let i = 0; i < numColumnasDias; i++) {
                    const cell = document.createElement("div");
                    cell.className = "w-32 h-full border-r border-slate-100 hover:bg-slate-50 transition-colors shrink-0 grid-cell";
                    cell.dataset.dayIndex = i;
                    cell.dataset.roomId = hab.id;

                    // Eventos para Drag and Drop
                    cell.addEventListener("dragover", handleDragOver);
                    cell.addEventListener("dragleave", handleDragLeave);
                    cell.addEventListener("drop", handleDrop);

                    row.appendChild(cell);
                }

                gridMatrixRows.appendChild(row);
            });

            // Renderizar las barras de reserva (con lo que haya en "reservas" hasta el momento)
            renderizarReservas();
        }

        // ------------------------------------------------------------------
        // Conexión con el backend (Java Servlet -> JDBC -> MySQL)
        // ------------------------------------------------------------------

        // Trae las reservas reales desde la base de datos y las transforma
        // al formato que usa el calendario (startCol/span/clase de estado).
        // (ES) Función que realiza un GET a /ReservaServlet y convierte cada
        // respuesta en el formato que usa la UI.
        // (EN) Fetches reservations from the server and maps them to UI objects.
        async function cargarReservas() {
            try {
                const respuesta = await fetch("ReservaServlet");

                if (!respuesta.ok) {
                    throw new Error("Error HTTP " + respuesta.status);
                }

                const datos = await respuesta.json();

                reservas = datos.map(construirReservaVisual);
                renderizarReservas();

            } catch (error) {
                console.error("No se pudieron cargar las reservas desde la base de datos:", error);
            }
        }

        // Convierte una fila JSON del servlet (fechas incluidas) en el objeto
        // que renderizarReservas() ya sabe pintar.
        // (ES) Traduce fechas y calcula columna de inicio y duración (span).
        // (EN) Converts servlet JSON row into a visual reservation object.
        function construirReservaVisual(r) {
            const fechaEntrada = new Date(r.fechaEntrada + "T00:00:00");
            const fechaSalida = new Date(r.fechaSalida + "T00:00:00");
            const msPorDia = 24 * 60 * 60 * 1000;

            const startCol = Math.round((fechaEntrada - fechaInicioCalendario) / msPorDia);
            let span = Math.round((fechaSalida - fechaEntrada) / msPorDia);
            if (span < 1) span = 1;

            return {
                id: r.id,
                huesped: `${r.nombre} ${r.apellido}`.trim(),
                documento: r.documento,
                telefono: r.telefono,
                correo: r.correo,
                habitacion: r.habitacion,
                startCol: startCol,
                span: span,
                estado: mapearEstadoAClase(r.estado)
            };
        }

        // La columna "estado" en la BD guarda texto libre (Confirmada, Pendiente, etc.)
        // Aquí se traduce a las clases CSS que ya existen en styles.css.
        function mapearEstadoAClase(estadoTexto) {
            if (!estadoTexto) return "status-confirmed";
            const e = estadoTexto.toLowerCase();
            if (e.includes("pend")) return "status-pending";
            if (e.includes("check-in") || e.includes("checkin")) return "status-checkin";
            if (e.includes("check-out") || e.includes("checkout") || e.includes("cancel")) return "status-checkout";
            return "status-confirmed";
        }

        // Renderizar Barras de Reserva con estilo trapezoidal
        // (ES) Crea elementos DOM para cada reserva visible y les aplica
        // estilos, posición y comportamiento de arrastrar.
        // (EN) Renders reservation bars in the calendar grid.
        function renderizarReservas() {
            // Limpiar reservas existentes
            document.querySelectorAll(".reservation-bar").forEach(el => el.remove());

            reservas.forEach(res => {
                // Si la reserva cae completamente fuera del rango visible del calendario, se omite
                if (res.startCol + res.span <= 0 || res.startCol >= numColumnasDias) return;

                const targetRow = document.querySelector(`[data-room-id="${res.habitacion}"]`);
                if (targetRow) {
                    const bar = document.createElement("div");
                    bar.className = `reservation-bar absolute h-10 top-2 z-10 px-4 flex items-center shadow-md font-medium text-xs ${res.estado}`;
                    bar.style.left = `${res.startCol * anchoColumnaPx + 8}px`;
                    bar.style.width = `${res.span * anchoColumnaPx - 16}px`;
                    bar.draggable = true;
                    bar.id = `reserva-${res.id}`;

                    bar.innerHTML = `
                        <i class="fa-solid fa-user-check text-[10px] mr-2 opacity-80"></i>
                        <span class="truncate">${res.huesped}</span>
                    `;

                    // Drag Events
                    bar.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", JSON.stringify(res));
                        bar.classList.add("opacity-50");
                    });

                    bar.addEventListener("dragend", () => {
                        bar.classList.remove("opacity-50");
                    });

                    targetRow.appendChild(bar);
                }
            });
        }

        // Lógica de Drag & Drop para mover reservas entre fechas o habitaciones
        // (ES) handleDragOver/Leave/Drop gestionan la interacción visual y al
        // soltar actualizan sólo la estructura en memoria (no la BD).
        // (EN) Drag & drop handlers for moving reservations visually.
        function handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add("drag-over");
        }

        function handleDragLeave(e) {
            e.currentTarget.classList.remove("drag-over");
        }

        function handleDrop(e) {
            e.preventDefault();
            e.currentTarget.classList.remove("drag-over");

            const resData = JSON.parse(e.dataTransfer.getData("text/plain"));
            const newRoomId = e.currentTarget.dataset.roomId;
            const newStartDay = parseInt(e.currentTarget.dataset.dayIndex);

            // Actualiza el objeto en memoria y repinta.
            // (Guardar el nuevo día/habitación en la BD queda pendiente como
            // siguiente paso: haría falta un endpoint PUT/POST adicional en el servlet).
            const resObj = reservas.find(r => r.id === resData.id);
            if (resObj) {
                resObj.habitacion = newRoomId;
                resObj.startCol = newStartDay;
                renderizarReservas();
            }
        }

        // Modal Handlers
        function abrirModal() {
            document.getElementById("modalReserva").classList.remove("hidden");
        }

        function cerrarModal() {
            document.getElementById("modalReserva").classList.add("hidden");
        }

        let reservaActualEditando = null;

        function abrirModalEditar(idReserva) {
            const reserva = reservas.find(r => r.id === idReserva);
            if (!reserva) return;

            // (ES) Guardamos la referencia de la reserva que se está editando.
            // (EN) Keep the reference to the reservation being edited.
            reservaActualEditando = reserva;

            // Rellenar los campos del formulario con los datos encontrados
            document.getElementById("editId").value = reserva.id;
            document.getElementById("editHuesped").value = reserva.huesped;
            document.getElementById("editDocumento").value = reserva.documento || "";
            document.getElementById("editTelefono").value = reserva.telefono || "";
            document.getElementById("editCorreo").value = reserva.correo || "";
            document.getElementById("editEstado").value = reserva.estado;

            document.getElementById("modalEditarReserva").classList.remove("hidden");
        }

        function cerrarModalEditar() {
            document.getElementById("modalEditarReserva").classList.add("hidden");
            reservaActualEditando = null;
        }

        // Simulación de actualización de datos (local, aún no persiste en BD)
        const formEditar = document.getElementById("formEditarReserva");
        if (formEditar) {
            formEditar.addEventListener("submit", function(e) {
                e.preventDefault();
                if (reservaActualEditando) {
                    reservaActualEditando.huesped = document.getElementById("editHuesped").value;
                    reservaActualEditando.estado = document.getElementById("editEstado").value;
                    cerrarModalEditar();
                    renderizarReservas();
                }
            });
        }

        // Inicializar al cargar la página
        window.onload = function() {
            inicializarCalendario();
            cargarReservas();
        };