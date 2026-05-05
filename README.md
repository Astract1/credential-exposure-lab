# Laboratorio: Exposicion de Credenciales en DevTools

Demostracion practica de como una aplicacion web puede exponer contrasenas en
texto plano durante el registro de usuarios, y por que esto representa una
**falla criptografica** segun OWASP Top 10 (A02:2021 - Cryptographic Failures).

## Objetivo

Comprobar si la aplicacion expone contrasenas en texto plano durante el
proceso de registro.

## Requisitos

- Node.js 18 o superior
- Navegador moderno (Chrome, Edge o Firefox)

## Instalacion y ejecucion

```bash
cd credential-exposure-lab
npm install
npm start
```

El servidor queda disponible en `http://localhost:3000`.

## Procedimiento del laboratorio

1. Abre `http://localhost:3000/index.html`.
2. Presiona **F12** para abrir las herramientas de desarrollador.
3. Entra a la pestana **Network** (Red).
4. Activa la opcion **Preserve log** (Conservar registro).
5. Completa el formulario con datos de prueba (por ejemplo: usuario `juan`,
   email `juan@test.com`, contrasena `Secreto123!`) y presiona **Registrar**.
6. En la lista de peticiones busca **`register`** y haz clic.
7. Ve a la pestana **Payload** (en Firefox: **Request** / **Peticion**).
8. **Evidencia 1**: captura de pantalla mostrando la contrasena en texto plano
   dentro del JSON enviado al servidor.
9. Abre `http://localhost:3000/admin/vulnerable-data` en otra pestana.
10. **Evidencia 2**: captura mostrando que la contrasena se almaceno tal cual
    en el servidor.

## Analisis esperado (entregable del estudiante)

Responde en el informe:

1. **Que informacion sensible aparecio en la pestana Payload?**
2. **Por que es una falla criptografica?** Relacionalo con OWASP A02:2021.
3. **Riesgos concretos** si esta aplicacion se desplegara en produccion:
   - Acceso al disco o a la base de datos del servidor permite leer
     directamente las credenciales.
   - Fugas en logs, backups o volcados de memoria revelan contrasenas.
   - Si los usuarios reutilizan contrasenas (muy comun), un atacante
     compromete tambien sus cuentas en otros servicios.
4. **Mitigaciones recomendadas**:
   - **Hashing con bcrypt / Argon2** y factor de costo configurable.
   - **Salt unico por usuario** (bcrypt y Argon2 lo incorporan).
   - El servidor nunca debe persistir la contrasena original.
   - Forzar **HTTPS (TLS)** para que el trafico no sea legible en la red.
   - Validacion de complejidad y longitud minima de la contrasena.
   - Rate limiting en el endpoint de registro.
   - Politicas contra contrasenas filtradas (HaveIBeenPwned).

## Estructura del proyecto

```
credential-exposure-lab/
|-- server.js                Servidor Express con el endpoint de registro
|-- package.json
|-- public/
|   |-- index.html           Formulario de registro
|   |-- app.js               Cliente del formulario
|   `-- style.css
`-- users-vulnerable.json    Generado al registrar (texto plano)
```

## Endpoints

| Metodo | Ruta                         | Descripcion                                |
|--------|------------------------------|--------------------------------------------|
| POST   | `/register`                  | Registro vulnerable (almacena texto plano) |
| GET    | `/admin/vulnerable-data`     | Lista de usuarios registrados              |
| POST   | `/admin/reset`               | Borra la base de datos                     |

## Reiniciar la base de datos

```bash
curl -X POST http://localhost:3000/admin/reset
```

O simplemente borra el archivo `users-vulnerable.json`.
