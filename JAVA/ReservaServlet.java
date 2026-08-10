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
@WebServlet("/ReservaServlet")
public class ReservaServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

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
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String accion = request.getParameter("accion");

        if ("actualizar".equals(accion)) {
            actualizarReserva(request, response);
        } else {
            crearReserva(request, response);
        }
    }

    // Usada por el formulario "+ Nueva Reserva" (envío de formulario normal, con redirect)
    private void crearReserva(HttpServletRequest request, HttpServletResponse response) throws IOException {

        Reserva reserva = new Reserva();
        reserva.setDocumento(request.getParameter("documento"));
        reserva.setNombres(request.getParameter("nombres"));
        reserva.setApellidos(request.getParameter("apellidos"));
        reserva.setTelefono(request.getParameter("telefono"));
        reserva.setCorreo(request.getParameter("correo"));
        reserva.setHabitacion(request.getParameter("habitacion"));
        reserva.setFechaEntrada(request.getParameter("fechaEntrada"));
        reserva.setFechaSalida(request.getParameter("fechaSalida"));

        if (esNuloOVacio(reserva.getDocumento()) || esNuloOVacio(reserva.getNombres())
                || esNuloOVacio(reserva.getApellidos()) || esNuloOVacio(reserva.getHabitacion())
                || esNuloOVacio(reserva.getFechaEntrada()) || esNuloOVacio(reserva.getFechaSalida())) {

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
                ps.setString(7, reserva.getFechaEntrada());
                ps.setString(8, reserva.getFechaSalida());
                ps.executeUpdate();
            }

            response.sendRedirect("index.html?reserva=exitosa");

        } catch (SQLException e) {
            e.printStackTrace();
            response.sendRedirect("index.html?reserva=error");
        }
    }

    // Usada por fetch() desde javascript.js: al arrastrar una reserva (y, si la
    // habilitas, también al guardar el formulario de edición). No redirige:
    // responde solo con un código HTTP y un JSON pequeño para que el fetch lo lea.
    private void actualizarReserva(HttpServletRequest request, HttpServletResponse response) throws IOException {

        response.setContentType("application/json;charset=UTF-8");

        String id = request.getParameter("id");
        Reserva reserva = new Reserva();
        reserva.setDocumento(request.getParameter("documento"));
        reserva.setNombres(request.getParameter("nombres"));
        reserva.setApellidos(request.getParameter("apellidos"));
        reserva.setTelefono(request.getParameter("telefono"));
        reserva.setCorreo(request.getParameter("correo"));
        reserva.setHabitacion(request.getParameter("habitacion"));
        reserva.setFechaEntrada(request.getParameter("fechaEntrada"));
        reserva.setFechaSalida(request.getParameter("fechaSalida"));
        String estado = request.getParameter("estado");

        if (esNuloOVacio(id) || esNuloOVacio(reserva.getHabitacion())
                || esNuloOVacio(reserva.getFechaEntrada()) || esNuloOVacio(reserva.getFechaSalida())) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            escribirJson(response, "{\"ok\":false,\"error\":\"Faltan campos obligatorios\"}");
            return;
        }

        String sql = "UPDATE reservas SET documento=?, nombre=?, apellido=?, telefono=?, correo=?, "
                + "habitacion=?, fecha_entrada=?, fecha_salida=?, estado=? WHERE id=?";

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
                ps.setString(7, reserva.getFechaEntrada());
                ps.setString(8, reserva.getFechaSalida());
                ps.setString(9, estado);
                ps.setInt(10, Integer.parseInt(id));
                ps.executeUpdate();
            }

            escribirJson(response, "{\"ok\":true}");

        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            escribirJson(response, "{\"ok\":false,\"error\":\"" + escapar(e.getMessage()) + "\"}");
        }
    }

    private void escribirJson(HttpServletResponse response, String json) throws IOException {
        try (PrintWriter out = response.getWriter()) {
            out.print(json);
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