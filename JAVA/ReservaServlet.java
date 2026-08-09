package JAVA;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * GET  /ReservaServlet  -> devuelve todas las reservas en JSON (las usa
 *                          javascript.js para pintar el calendario).
 * POST /ReservaServlet  -> guarda una reserva nueva (formulario del modal).
 */
/**
 * (ES) Este servlet expone dos operaciones principales:
 *  - GET  /ReservaServlet: devuelve todas las reservas en formato JSON.
 *    Este JSON es consumido por el front-end (javascript.js) para mostrar
 *    la matriz de calendario.
 *  - POST /ReservaServlet: recibe los datos del formulario de nueva
 *    reserva y los inserta en la base de datos.
 *
 * Mantengo el comentario en inglés arriba y añado esta explicación en español
 * para facilitar el aprendizaje.
 */
@WebServlet("/ReservaServlet")
public class ReservaServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
        // (ES) Maneja las peticiones GET a /ReservaServlet.
        // Devuelve todas las reservas en formato JSON para que el frontend
        // pueda pintarlas en la matriz del calendario.
        // (EN) Handles GET requests and returns all reservations as JSON.
        @Override
        protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");

        String sql = "SELECT id, documento, nombre, apellido, telefono, correo, habitacion, "
                + "fecha_entrada, fecha_salida, estado FROM reservas ORDER BY fecha_entrada ASC";

        StringBuilder json = new StringBuilder("[");

        try (Connection con = ConexionDB.obtenerConexion();
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {

            boolean primero = true;
            while (rs.next()) {
                if (!primero) json.append(",");
                primero = false;

                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"documento\":\"").append(escapar(rs.getString("documento"))).append("\",")
                    .append("\"nombre\":\"").append(escapar(rs.getString("nombre"))).append("\",")
                    .append("\"apellido\":\"").append(escapar(rs.getString("apellido"))).append("\",")
                    .append("\"telefono\":\"").append(escapar(rs.getString("telefono"))).append("\",")
                    .append("\"correo\":\"").append(escapar(rs.getString("correo"))).append("\",")
                    .append("\"habitacion\":\"").append(escapar(rs.getString("habitacion"))).append("\",")
                    .append("\"fechaEntrada\":\"").append(rs.getDate("fecha_entrada")).append("\",")
                    .append("\"fechaSalida\":\"").append(rs.getDate("fecha_salida")).append("\",")
                    .append("\"estado\":\"").append(escapar(rs.getString("estado"))).append("\"")
                    .append("}");
            }

        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = response.getWriter()) {
                out.print("{\"error\":\"" + escapar(e.getMessage()) + "\"}");
            }
            return;
        }

        json.append("]");

        try (PrintWriter out = response.getWriter()) {
            out.print(json.toString());
        }
    }

    @Override
        // (ES) Maneja las peticiones POST desde el formulario de nueva reserva.
        // Valida campos mínimos e inserta la reserva en la BD, luego redirige
        // al index con un parámetro que indica éxito o error.
        // (EN) Handles POST requests to insert a new reservation.
        @Override
        protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        Reserva reserva = new Reserva();
        reserva.setDocumento(request.getParameter("documento"));
        reserva.setNombres(request.getParameter("nombres"));
        reserva.setApellidos(request.getParameter("apellidos"));
        reserva.setTelefono(request.getParameter("telefono"));
        reserva.setCorreo(request.getParameter("correo"));
        reserva.setHabitacion(request.getParameter("habitacion"));
        reserva.setFecha_entrada(request.getParameter("fechaEntrada"));
        reserva.setFecha_salida(request.getParameter("fechaSalida"));

        if (esNuloOVacio(reserva.getDocumento()) || esNuloOVacio(reserva.getNombres())
                || esNuloOVacio(reserva.getApellidos()) || esNuloOVacio(reserva.getHabitacion())
                || esNuloOVacio(reserva.getFecha_entrada()) || esNuloOVacio(reserva.getFecha_salida())) {

            response.sendRedirect("index.html?reserva=error&motivo=camposFaltantes");
            return;
        }

        // La tabla real usa "nombre" y "apellido" (singular) — ver captura de phpMyAdmin
        String sql = "INSERT INTO reservas "
                + "(documento, nombre, apellido, telefono, correo, habitacion, fecha_entrada, fecha_salida) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = ConexionDB.obtenerConexion()) {

            if (con == null) {
                throw new SQLException("No se pudo establecer conexión con la base de datos.");
            }

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, reserva.getDocumento());
                ps.setString(2, reserva.getNombres());
                ps.setString(3, reserva.getApellidos());
                ps.setString(4, reserva.getTelefono());
                ps.setString(5, reserva.getCorreo());
                ps.setString(6, reserva.getHabitacion());
                ps.setString(7, reserva.getFecha_entrada());
                ps.setString(8, reserva.getFecha_salida());
                ps.executeUpdate();
            }

            response.sendRedirect("index.html?reserva=exitosa");

        } catch (SQLException e) {
            e.printStackTrace();
            response.sendRedirect("index.html?reserva=error");
        }
    }

    private boolean esNuloOVacio(String valor) {
        return valor == null || valor.trim().isEmpty();
    }

    private String escapar(String valor) {
        if (valor == null) return "";
        return valor.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}