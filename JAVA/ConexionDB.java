package JAVA;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * (ES) Clase de utilidad para obtener conexiones JDBC a la base de datos MySQL.
 * Contiene la URL de conexión, usuario y contraseña (actualmente en claro).
 *
 * (EN) Utility class to obtain JDBC connections to MySQL database.
 */
public class ConexionDB {
    private static final String URL =
            "jdbc:mysql://localhost:3306/pms_hotel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USUARIO = "root";
    private static final String PASSWORD = "";

    public static Connection obtenerConexion() {
        // (ES) Intenta cargar el driver JDBC y devolver una conexión.
        // (EN) Attempts to load the JDBC driver and return a Connection.
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(URL, USUARIO, PASSWORD);
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("No se encontró el driver JDBC de MySQL", e);
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudo conectar a MySQL: " + e.getMessage(), e);
        }
    }
}