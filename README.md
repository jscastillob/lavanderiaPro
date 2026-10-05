# CleanPro - Sistema de Lavandería

## 🏗️ Arquitectura

Esta aplicación está diseñada con una arquitectura frontend/backend separada:

- **Frontend**: React + Vite + Tailwind CSS (este proyecto)
- **Backend**: ASP.NET Web API (C#) - Para conectar con SQL Server
- **Base de Datos**: Microsoft SQL Server
- **Hosting**: IIS (Internet Information Services)

## 📋 Características

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de clientes (CRUD)
- ✅ Gestión de servicios de lavandería con precios
- ✅ Registro y seguimiento de órdenes
- ✅ Flujo de estados: Recibido → Lavado → Secado → Planchado → Listo → Entregado
- ✅ Reportes con gráficos (ingresos, servicios, estados)
- ✅ Datos de demostración incluidos
- ✅ Diseño responsivo (móvil y escritorio)

## 🚀 Publicación en IIS

### Opción 1: Solo Frontend (Modo Actual)

1. Ejecutar `npm run build`
2. Copiar la carpeta `dist/` al directorio del sitio en IIS
3. Configurar el sitio en IIS apuntando a esa carpeta
4. Los datos se guardan en localStorage del navegador

### Opción 2: Con Backend SQL Server (Producción)

#### Paso 1: Crear el Backend ASP.NET

```bash
dotnet new webapi -n CleanPro.API
cd CleanPro.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

#### Paso 2: Configurar la Base de Datos SQL Server

Ejecutar en SQL Server Management Studio:

```sql
-- Crear base de datos
CREATE DATABASE CleanProDB;
GO

USE CleanProDB;
GO

-- Tabla Clientes
CREATE TABLE Clientes (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  Nombre NVARCHAR(100) NOT NULL,
  Telefono NVARCHAR(20),
  Email NVARCHAR(100),
  Direccion NVARCHAR(200),
  Notas NVARCHAR(500),
  FechaRegistro DATETIME2 DEFAULT GETDATE()
);

-- Tabla Servicios
CREATE TABLE Servicios (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  Nombre NVARCHAR(100) NOT NULL,
  Descripcion NVARCHAR(300),
  Precio DECIMAL(10,2) NOT NULL,
  TiempoEstimado INT NOT NULL,
  Activo BIT DEFAULT 1
);

-- Tabla Órdenes
CREATE TABLE Ordenes (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  NumeroOrden NVARCHAR(20) UNIQUE NOT NULL,
  ClienteId UNIQUEIDENTIFIER NOT NULL REFERENCES Clientes(Id),
  Estado NVARCHAR(20) DEFAULT 'recibido',
  FechaIngreso DATETIME2 DEFAULT GETDATE(),
  FechaEstimadaEntrega DATETIME2,
  FechaEntrega DATETIME2,
  Total DECIMAL(10,2),
  Pagado BIT DEFAULT 0,
  Notas NVARCHAR(500)
);

-- Tabla Detalle de Orden
CREATE TABLE DetalleOrden (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  OrdenId UNIQUEIDENTIFIER NOT NULL REFERENCES Ordenes(Id) ON DELETE CASCADE,
  ServicioId UNIQUEIDENTIFIER NOT NULL REFERENCES Servicios(Id),
  Cantidad INT NOT NULL
);

-- Índices para mejor rendimiento
CREATE INDEX IX_Ordenes_ClienteId ON Ordenes(ClienteId);
CREATE INDEX IX_Ordenes_Estado ON Ordenes(Estado);
CREATE INDEX IX_Ordenes_FechaIngreso ON Ordenes(FechaIngreso);
CREATE INDEX IX_DetalleOrden_OrdenId ON DetalleOrden(OrdenId);
GO
```

#### Paso 3: Crear los Controladores API (C#)

```csharp
// Controllers/ClientesController.cs
[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly CleanProContext _context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
    {
        return await _context.Clientes.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Cliente>> GetCliente(Guid id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null) return NotFound();
        return cliente;
    }

    [HttpPost]
    public async Task<ActionResult<Cliente>> PostCliente(Cliente cliente)
    {
        cliente.Id = Guid.NewGuid();
        cliente.FechaRegistro = DateTime.Now;
        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, cliente);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCliente(Guid id, Cliente cliente)
    {
        if (id != cliente.Id) return BadRequest();
        _context.Entry(cliente).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCliente(Guid id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null) return NotFound();
        _context.Clientes.Remove(cliente);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```

#### Paso 4: Configurar CORS para el Frontend

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://tu-dominio.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

#### Paso 5: Modificar el Frontend para usar el API

En `src/data/store.ts`, reemplazar las funciones con llamadas fetch:

```typescript
const API_URL = 'https://tu-servidor.com/api';

export const getClientes = async (): Promise<Cliente[]> => {
  const response = await fetch(`${API_URL}/clientes`);
  return response.json();
};

export const saveCliente = async (cliente: Omit<Cliente, 'id' | 'fechaRegistro'>): Promise<Cliente> => {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  return response.json();
};
```

#### Paso 6: Publicar en IIS

1. **Backend**: 
   ```bash
   dotnet publish -c Release -o ./publish
   ```
   - Instalar el Hosting Bundle de ASP.NET en el servidor
   - Crear sitio en IIS apuntando a la carpeta `publish`
   - Configurar el Application Pool como "No Managed Code"

2. **Frontend**:
   ```bash
   npm run build
   ```
   - Copiar la carpeta `dist/` al directorio del sitio IIS
   - Configurar URL Rewrite para SPA:
   
   ```xml
   <!-- web.config -->
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="SPA Routes" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/index.html" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

## 🔧 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Gráficos | Recharts |
| Backend | ASP.NET Core Web API |
| ORM | Entity Framework Core |
| Base de Datos | SQL Server |
| Hosting | IIS |

## 📁 Estructura del Proyecto

```
src/
├── App.tsx           # Router principal
├── main.tsx          # Entry point
├── index.css         # Estilos globales
├── types/
│   └── index.ts      # Interfaces TypeScript
├── data/
│   └── store.ts      # Capa de datos (localStorage / API)
├── components/
│   └── Layout.tsx    # Layout con sidebar
└── pages/
    ├── Dashboard.tsx  # Panel principal
    ├── Ordenes.tsx    # Gestión de órdenes
    ├── Clientes.tsx   # Gestión de clientes
    ├── Servicios.tsx  # Gestión de servicios
    └── Reportes.tsx   # Reportes y gráficos
```

## 💡 Notas

- La aplicación funciona completamente en modo demo con localStorage
- Para producción, se necesita el backend ASP.NET conectado a SQL Server
- Los datos de demostración se generan automáticamente en la primera carga
- El diseño es completamente responsivo para uso en tablets y móviles
