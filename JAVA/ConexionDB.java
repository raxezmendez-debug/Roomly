package JAVA;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConexionDB {
    private static final String URL =
            "jdbc:mysql://localhost:3306/pms_hotel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USUARIO = "root";
    private static final String PASSWORD = "";

    public static Connection obtenerConexion() {
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