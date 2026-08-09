package JAVA;

/**
 * (ES) POJO que representa una reserva. Cada propiedad corresponde a una
 * columna de la tabla `reservas` en la base de datos y a los campos del
 * formulario en `index.html`.
 *
 * (EN) Plain Old Java Object representing a reservation.
 */
public class Reserva {

    // (ES) Documento de identidad del huésped.
    // (EN) Guest identification document.
    private String documento;

    // (ES) Nombres del huésped.
    // (EN) Guest first names.
    private String nombres;

    // (ES) Apellidos del huésped.
    // (EN) Guest last names.
    private String apellidos;

    // (ES) Teléfono de contacto.
    // (EN) Contact phone.
    private String telefono;

    // (ES) Correo electrónico.
    // (EN) Email.
    private String correo;

    // (ES) Identificador / nombre de la habitación asignada.
    // (EN) Assigned room identifier.
    private String habitacion;

    // (ES) Fecha de entrada (formato 'YYYY-MM-DD').
    // (EN) Check-in date.
    private String fecha_entrada;

    // (ES) Fecha de salida (formato 'YYYY-MM-DD').
    // (EN) Check-out date.
    private String fecha_salida;

    // (ES) Estado de la reserva (Confirmada, Pendiente, Check-In, ...).
    // (EN) Reservation status.
    private String estado;

    public Reserva() {
    }

    public Reserva(String documento, String nombres, String apellidos, String telefono, String correo,
                String habitacion, String fecha_entrada, String fecha_salida, String estado) {
        this.documento = documento;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.telefono = telefono;
        this.correo = correo;
        this.habitacion = habitacion;
        this.fecha_entrada = fecha_entrada;
        this.fecha_salida = fecha_salida;
        this.estado = estado;
    }

    // Getters y setters (ES) / Getters and setters (EN)
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getHabitacion() { return habitacion; }
    public void setHabitacion(String habitacion) { this.habitacion = habitacion; }

    public String getFecha_entrada() { return fecha_entrada; }
    public void setFecha_entrada(String fecha_entrada) { this.fecha_entrada = fecha_entrada; }

    public String getFecha_salida() { return fecha_salida; }
    public void setFecha_salida(String fecha_salida) { this.fecha_salida = fecha_salida; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}