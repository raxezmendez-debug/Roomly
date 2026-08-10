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
            const editHabitacion = document.getElementById("editHabitacion");

            roomListContainer.innerHTML = "";
            headerDaysRow.innerHTML = "";
            gridMatrixRows.innerHTML = "";
            selectHabitacion.innerHTML = "";
            if (editHabitacion) editHabitacion.innerHTML = "";

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
                // Populate select option (modal Nueva Reserva)
                const opt = document.createElement("option");
                opt.value = hab.id;
                opt.textContent = `${hab.tipo} - ${hab.nombre}`;
                selectHabitacion.appendChild(opt);

                // Populate select option (modal Editar Reserva)
                if (editHabitacion) {
                    const optEdit = document.createElement("option");
                    optEdit.value = hab.id;
                    optEdit.textContent = `${hab.tipo} - ${hab.nombre}`;
                    editHabitacion.appendChild(optEdit);
                }

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
        // al formato que usa el calendario.
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

        // Convierte una fila JSON del servlet en el objeto de trabajo que usa
        // el calendario. Guarda las fechas reales (Date) para poder recalcular
        // la posición y también para poblar el formulario de edición.
        function construirReservaVisual(r) {
            return {
                id: r.id,
                nombre: r.nombre,
                apellido: r.apellido,
                huesped: `${r.nombre} ${r.apellido}`.trim(),
                documento: r.documento,
                telefono: r.telefono,
                correo: r.correo,
                habitacion: r.habitacion,
                fechaEntrada: new Date(r.fechaEntrada + "T00:00:00"),
                fechaSalida: new Date(r.fechaSalida + "T00:00:00"),
                estadoTexto: r.estado,                          // valor crudo tal cual está en la BD
                estado: mapearEstadoAClase(r.estado)             // clase CSS (status-confirmed, etc.)
            };
        }

        // Calcula en qué columna del calendario empieza la barra y cuántas
        // columnas ocupa, a partir de las fechas reales de la reserva.
        function calcularPosicion(reserva) {
            const msPorDia = 24 * 60 * 60 * 1000;
            const startCol = Math.round((reserva.fechaEntrada - fechaInicioCalendario) / msPorDia);
            let span = Math.round((reserva.fechaSalida - reserva.fechaEntrada) / msPorDia);
            if (span < 1) span = 1;
            return { startCol, span };
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

        // Formatea una fecha como YYYY-MM-DD para <input type="date"> y para
        // enviarla al servlet (sin usar toISOString, que desfasa por huso horario).
        function formatearFechaISO(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }

        // Formatea una fecha en español para mostrarla en la vista de detalle.
        function formatearFechaLegible(date) {
            return date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
        }

        // Renderizar Barras de Reserva con estilo trapezoidal
        function renderizarReservas() {
            // Limpiar reservas existentes
            document.querySelectorAll(".reservation-bar").forEach(el => el.remove());

            reservas.forEach(res => {
                const { startCol, span } = calcularPosicion(res);

                // Si la reserva cae completamente fuera del rango visible del calendario, se omite
                if (startCol + span <= 0 || startCol >= numColumnasDias) return;

                const targetRow = document.querySelector(`[data-room-id="${res.habitacion}"]`);
                if (targetRow) {
                    const bar = document.createElement("div");
                    bar.className = `reservation-bar absolute h-10 top-2 z-10 px-4 flex items-center shadow-md font-medium text-xs ${res.estado}`;
                    bar.style.left = `${startCol * anchoColumnaPx + 8}px`;
                    bar.style.width = `${span * anchoColumnaPx - 16}px`;
                    bar.draggable = true;
                    bar.id = `reserva-${res.id}`;

                    bar.innerHTML = `
                        <i class="fa-solid fa-user-check text-[10px] mr-2 opacity-80"></i>
                        <span class="truncate">${res.huesped}</span>
                    `;

                    // Clic -> abre el detalle de la reserva (solo lectura + botón Editar)
                    bar.addEventListener("click", () => abrirDetalleReserva(res.id));

                    // Drag Events
                    bar.addEventListener("dragstart", (e) => {
                        e.dataTransfer.setData("text/plain", JSON.stringify({ id: res.id, startCol }));
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
        function handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add("drag-over");
        }

        function handleDragLeave(e) {
            e.currentTarget.classList.remove("drag-over");
        }

        // Al soltar la barra: actualiza en memoria, repinta de inmediato, y
        // guarda el cambio en MySQL (fecha_entrada, fecha_salida, habitacion).
        async function handleDrop(e) {
            e.preventDefault();
            e.currentTarget.classList.remove("drag-over");

            const resData = JSON.parse(e.dataTransfer.getData("text/plain"));
            const newRoomId = e.currentTarget.dataset.roomId;
            const newStartDay = parseInt(e.currentTarget.dataset.dayIndex);

            const resObj = reservas.find(r => r.id === resData.id);
            if (!resObj) return;

            const deltaDias = newStartDay - resData.startCol;
            if (deltaDias === 0 && newRoomId === resObj.habitacion) return; // no cambió nada

            // Actualiza en memoria y repinta de inmediato (respuesta visual instantánea)
            const nuevaFechaEntrada = new Date(resObj.fechaEntrada);
            nuevaFechaEntrada.setDate(nuevaFechaEntrada.getDate() + deltaDias);
            const nuevaFechaSalida = new Date(resObj.fechaSalida);
            nuevaFechaSalida.setDate(nuevaFechaSalida.getDate() + deltaDias);

            resObj.habitacion = newRoomId;
            resObj.fechaEntrada = nuevaFechaEntrada;
            resObj.fechaSalida = nuevaFechaSalida;
            renderizarReservas();

            // Guarda el movimiento en la base de datos
            try {
                const params = new URLSearchParams();
                params.append("accion", "actualizar");
                params.append("id", resObj.id);
                params.append("documento", resObj.documento || "");
                params.append("nombres", resObj.nombre || "");
                params.append("apellidos", resObj.apellido || "");
                params.append("telefono", resObj.telefono || "");
                params.append("correo", resObj.correo || "");
                params.append("habitacion", resObj.habitacion);
                params.append("fechaEntrada", formatearFechaISO(resObj.fechaEntrada));
                params.append("fechaSalida", formatearFechaISO(resObj.fechaSalida));
                params.append("estado", resObj.estadoTexto);

                const resp = await fetch("ReservaServlet", { method: "POST", body: params });
                if (!resp.ok) throw new Error("Error HTTP " + resp.status);

            } catch (error) {
                console.error("No se pudo guardar el movimiento de la reserva en la BD:", error);
                alert("El cambio se ve en pantalla, pero no se pudo guardar en la base de datos. Recarga la página e inténtalo de nuevo.");
            }
        }

        // ------------------------------------------------------------------
        // Modal "+ Nueva Reserva"
        // ------------------------------------------------------------------
        function abrirModal() {
            document.getElementById("modalReserva").classList.remove("hidden");
        }

        function cerrarModal() {
            document.getElementById("modalReserva").classList.add("hidden");
        }

        // ------------------------------------------------------------------
        // Modal "Detalle de Reserva" (solo lectura) + "Editar"
        // ------------------------------------------------------------------
        let reservaActualDetalle = null;

        function abrirDetalleReserva(id) {
            const reserva = reservas.find(r => r.id === id);
            if (!reserva) return;

            reservaActualDetalle = reserva;
            mostrarVistaDetalle(reserva);
            document.getElementById("modalDetalleReserva").classList.remove("hidden");
        }

        function mostrarVistaDetalle(reserva) {
            document.getElementById("detalleHuesped").textContent = reserva.huesped;
            document.getElementById("detalleHabitacion").textContent = reserva.habitacion;
            document.getElementById("detalleDocumento").textContent = reserva.documento || "—";
            document.getElementById("detalleTelefono").textContent = reserva.telefono || "—";
            document.getElementById("detalleCorreo").textContent = reserva.correo || "—";
            document.getElementById("detalleFechaEntrada").textContent = formatearFechaLegible(reserva.fechaEntrada);
            document.getElementById("detalleFechaSalida").textContent = formatearFechaLegible(reserva.fechaSalida);

            const badge = document.getElementById("detalleEstadoBadge");
            badge.textContent = reserva.estadoTexto;
            badge.className = `text-xs font-semibold px-3 py-1.5 rounded-full ${reserva.estado}`;

            document.getElementById("vistaDetalleReserva").classList.remove("hidden");
            document.getElementById("formEditarReserva").classList.add("hidden");
        }

        function mostrarVistaEdicion() {
            const r = reservaActualDetalle;
            if (!r) return;

            document.getElementById("editId").value = r.id;
            document.getElementById("editNombres").value = r.nombre;
            document.getElementById("editApellidos").value = r.apellido;
            document.getElementById("editDocumento").value = r.documento || "";
            document.getElementById("editTelefono").value = r.telefono || "";
            document.getElementById("editCorreo").value = r.correo || "";
            document.getElementById("editHabitacion").value = r.habitacion;
            document.getElementById("editFechaEntrada").value = formatearFechaISO(r.fechaEntrada);
            document.getElementById("editFechaSalida").value = formatearFechaISO(r.fechaSalida);
            document.getElementById("editEstado").value = r.estadoTexto;

            document.getElementById("vistaDetalleReserva").classList.add("hidden");
            document.getElementById("formEditarReserva").classList.remove("hidden");
        }

        function cancelarEdicionReserva() {
            if (reservaActualDetalle) mostrarVistaDetalle(reservaActualDetalle);
        }

        function cerrarModalDetalle() {
            document.getElementById("modalDetalleReserva").classList.add("hidden");
            reservaActualDetalle = null;
        }

        // Guardar edición: por ahora actualiza SOLO en memoria (no persiste en
        // la BD todavía). El endpoint del servlet ya soporta accion=actualizar,
        // así que cuando quieras guardar la edición en MySQL, descomenta el
        // bloque fetch(...) de más abajo (es igual al que usa handleDrop).
        const formEditar = document.getElementById("formEditarReserva");
        if (formEditar) {
            formEditar.addEventListener("submit", function (e) {
                e.preventDefault();
                if (!reservaActualDetalle) return;

                reservaActualDetalle.nombre = document.getElementById("editNombres").value;
                reservaActualDetalle.apellido = document.getElementById("editApellidos").value;
                reservaActualDetalle.huesped = `${reservaActualDetalle.nombre} ${reservaActualDetalle.apellido}`.trim();
                reservaActualDetalle.documento = document.getElementById("editDocumento").value;
                reservaActualDetalle.telefono = document.getElementById("editTelefono").value;
                reservaActualDetalle.correo = document.getElementById("editCorreo").value;
                reservaActualDetalle.habitacion = document.getElementById("editHabitacion").value;
                reservaActualDetalle.fechaEntrada = new Date(document.getElementById("editFechaEntrada").value + "T00:00:00");
                reservaActualDetalle.fechaSalida = new Date(document.getElementById("editFechaSalida").value + "T00:00:00");
                reservaActualDetalle.estadoTexto = document.getElementById("editEstado").value;
                reservaActualDetalle.estado = mapearEstadoAClase(reservaActualDetalle.estadoTexto);

                /* --- Para que la edición también quede guardada en MySQL, descomenta esto: ---
                const params = new URLSearchParams();
                params.append("accion", "actualizar");
                params.append("id", reservaActualDetalle.id);
                params.append("documento", reservaActualDetalle.documento);
                params.append("nombres", reservaActualDetalle.nombre);
                params.append("apellidos", reservaActualDetalle.apellido);
                params.append("telefono", reservaActualDetalle.telefono);
                params.append("correo", reservaActualDetalle.correo);
                params.append("habitacion", reservaActualDetalle.habitacion);
                params.append("fechaEntrada", formatearFechaISO(reservaActualDetalle.fechaEntrada));
                params.append("fechaSalida", formatearFechaISO(reservaActualDetalle.fechaSalida));
                params.append("estado", reservaActualDetalle.estadoTexto);
                fetch("ReservaServlet", { method: "POST", body: params })
                    .catch(err => console.error("No se pudo guardar la edición en la BD:", err));
                --------------------------------------------------------------------------------- */

                cerrarModalDetalle();
                renderizarReservas();
            });
        }

        // Inicializar al cargar la página
        window.onload = function () {
            inicializarCalendario();
            cargarReservas();
        };
