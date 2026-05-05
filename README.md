# Laboratorio: Exposicion de Credenciales en DevTools

Demostracion practica de como una aplicacion web puede exponer contrasenas en
texto plano durante el registro de usuarios, y por que esto representa una
**falla criptografica** segun OWASP Top 10 (A02:2021 - Cryptographic Failures).

## Objetivo

Comprobar si la aplicacion expone contrasenas en texto plano durante el
proceso de registro y comparar con una version que aplica hashing (bcrypt).

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

### Parte 1 - Version vulnerable

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

### Parte 2 - Version segura (comparativa)

1. Abre `http://localhost:3000/secure.html`.
2. Repite el procedimiento (F12, Network, Preserve log, registrar usuario).
3. Inspecciona la peticion `register-secure` en la pestana **Payload**.
4. Abre `http://localhost:3000/admin/secure-data`.
5. **Evidencia 3**: captura mostrando que el servidor almaceno un **hash bcrypt**
   en lugar de la contrasena original.

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
4. **Mitigaciones aplicadas en la version segura**:
   - **Hashing con bcrypt** y factor de costo configurable.
   - **Salt unico por usuario** (bcrypt lo incorpora automaticamente).
   - El servidor nunca persiste la contrasena original.
5. **Mitigaciones adicionales recomendadas**:
   - Forzar **HTTPS (TLS)** para que el trafico no sea legible en la red.
   - Validacion de complejidad y longitud minima de la contrasena.
   - Rate limiting en el endpoint de registro.
   - Politicas contra contrasenas filtradas (HaveIBeenPwned).

## Nota importante

> Aunque la version segura aplica bcrypt en el servidor, la contrasena
> **sigue apareciendo** en la pestana Payload del navegador. Esto es
> esperado: DevTools ve la peticion **antes** de que TLS la cifre.
> La proteccion en transito la da **HTTPS**; la proteccion en reposo
> la da el **hashing**. Ambas capas son necesarias.

## Estructura del proyecto

```
credential-exposure-lab/
|-- server.js                Servidor Express con ambos endpoints
|-- package.json
|-- public/
|   |-- index.html           Formulario vulnerable
|   |-- secure.html          Formulario seguro
|   |-- app.js               Cliente del formulario vulnerable
|   |-- secure.js            Cliente del formulario seguro
|   `-- style.css
|-- users-vulnerable.json    Generado al registrar (texto plano)
`-- users-secure.json        Generado al registrar (bcrypt)
```

## Endpoints

| Metodo | Ruta                         | Descripcion                                |
|--------|------------------------------|--------------------------------------------|
| POST   | `/register`                  | Registro vulnerable (almacena texto plano) |
| POST   | `/register-secure`           | Registro seguro (almacena hash bcrypt)     |
| GET    | `/admin/vulnerable-data`     | Lista de usuarios vulnerables              |
| GET    | `/admin/secure-data`         | Lista de usuarios seguros                  |
| POST   | `/admin/reset`               | Borra ambas bases de datos                 |

## Reiniciar las bases de datos

```bash
curl -X POST http://localhost:3000/admin/reset
```

O simplemente borra los archivos `users-vulnerable.json` y `users-secure.json`.
