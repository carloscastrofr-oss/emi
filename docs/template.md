# [NOMBRE DEL PRODUCTO]

[Tipo de solución / agente]
[Mes Año]

---

## Control de versiones del documento

| Fecha        | Owner    | Versión | Estatus                    |
| ------------ | -------- | ------- | -------------------------- |
| [QX / Fecha] | [Nombre] | [1.0]   | [En definición / Aprobado] |

> Nota: Actualizar esta tabla cada vez que el documento sufra cambios relevantes.

---

## Índice

1. Resumen Ejecutivo
   1.1 Propósito del Producto
   1.2 Objetivos de Negocio
   1.3 Usuarios Target
2. Problema y Oportunidad
   2.1 Problema Actual
   2.2 Oportunidad
3. Alcance del Producto
   3.1 En Alcance (MVP)
   3.2 Fuera de Alcance (Futuro)
4. Requisitos Funcionales
   4.1 [Grupo de Funcionalidad #1]
   4.2 [Grupo de Funcionalidad #2]
   4.3 [Agregar grupos según sea necesario]
5. Requisitos No Funcionales
   5.1 Performance
   5.2 Escalabilidad
   5.3 Calidad
   5.4 Seguridad
   5.5 Usabilidad
6. Arquitectura Técnica
   6.1 Stack Tecnológico
   6.2 Flujos de IA
   6.3 Estructura de Datos
   6.4 Metaprompt / Prompting
7. Flujo de Usuario
   7.1 Flujo Principal
   7.2 Flujos Secundarios (opcional)
8. Métricas de Éxito
   8.1 KPIs de Producto
   8.2 KPIs Técnicos
   8.3 KPIs de Negocio
9. Roadmap
   [Fases por trimestre o release]
10. Riesgos y Mitigaciones
11. Dependencias
    11.1 Externas
    11.2 Internas
12. Aprobaciones
13. Historial de Cambios

---

## 1. Resumen Ejecutivo

### 1.1 Propósito del Producto

[Describir en 2–4 frases qué hace el producto/agente, para quién es y qué problema resuelve. Mantener un tono claro y directo.]

### 1.2 Objetivos de Negocio

- [Objetivo 1 de negocio]
- [Objetivo 2 de negocio]
- [Objetivo 3 de negocio]

> Tip: Usar verbos de impacto (acelerar, reducir, escalar, mejorar, automatizar) y, cuando sea posible, cuantificar (porcentaje, tiempos, costos).

### 1.3 Usuarios Target

- [Rol principal #1]: [Qué hace con el producto]
- [Rol principal #2]: [Qué hace con el producto]
- [Otros roles relevantes]

---

## 2. Problema y Oportunidad

### 2.1 Problema Actual

- [Dolor / ineficiencia #1]
- [Dolor / ineficiencia #2]
- [Dolor / ineficiencia #3]

> Tip: Enfocarse en tiempos, costos, riesgos, fricción operativa o de experiencia de usuario.

### 2.2 Oportunidad

- [Factor tecnológico / de mercado #1]
- [Beneficio potencial #2]
- [Reducción de costos / aumento de velocidad / escalabilidad]

---

## 3. Alcance del Producto

### 3.1 En Alcance (MVP)

✅ [Bloque funcional 1]

- [Punto concreto de funcionalidad]
- [Punto concreto de funcionalidad]

✅ [Bloque funcional 2]

- [Punto concreto de funcionalidad]

> Incluir únicamente lo que razonablemente se puede entregar en el MVP.

### 3.2 Fuera de Alcance (Futuro)

❌ [Funcionalidad futura 1]
❌ [Funcionalidad futura 2]
❌ [Integraciones o módulos avanzados]

> Si algo no está claro aún, especificar: "Aún no se ha definido el alcance futuro de este punto".

---

## 4. Requisitos Funcionales

> Formato sugerido por requisito: **ID + Nombre + Descripción + Criterios de Aceptación + Prioridad + Complejidad**.

### 4.1 [Grupo de Funcionalidad #1]

**RF-001: [Nombre del Requisito]**
**Descripción:** [Descripción breve y clara de lo que hace este requisito.]
**Criterios de Aceptación:**

- [Criterio 1]
- [Criterio 2]
- [Criterio 3]
  **Prioridad:** [Alta / Media / Baja]
  **Complejidad:** [Baja / Media / Alta]

**RF-002: [Nombre del Requisito]**
**Descripción:** [...]
**Criterios de Aceptación:**

- [...]
  **Prioridad:** [...]
  **Complejidad:** [...]

### 4.2 [Grupo de Funcionalidad #2]

**RF-00X: [Nombre del Requisito]**
**Descripción:** [...]
**Criterios de Aceptación:**

- [...]
  **Prioridad:** [...]
  **Complejidad:** [...]

> Agregar más subsecciones 4.x según se agrupen las funcionalidades (gestión de instancias, recursos, generación, analytics, etc.). Mantener consistencia en el formato de IDs.

---

## 5. Requisitos No Funcionales

### 5.1 Performance

- [Tiempo máximo aceptable para operaciones clave]
- [Tiempos de carga de pantallas críticas]

### 5.2 Escalabilidad

- [Límites aproximados de uso por unidad (usuario / instancia / cliente)]
- [Escenarios de uso concurrente]

### 5.3 Calidad

- [Resolución mínima / exactitud / consistencia esperada]
- [Porcentaje de resultados relevantes / aprobados]

### 5.4 Seguridad

- [Autenticación y autorización]
- [Privacidad de datos y accesos]
- [Manejo de enlaces públicos / temporales]

### 5.5 Usabilidad

- [Nivel de simplicidad de la UI]
- [Requerimientos de feedback visual y manejo de errores]

> Si algún aspecto aún no está definido, escribir explícitamente: "Aún no se han definido requisitos no funcionales para [tema]".

---

## 6. Arquitectura Técnica

### 6.1 Stack Tecnológico

- Frontend: [Framework + versión]
- Backend: [Plataforma / servicios]
- IA: [Modelo(s) de IA usados]
- Otros: [Procesamiento de documentos, librerías, etc.]

### 6.2 Flujos de IA

Ruta de código sugerida: `src/ai/flows/`

- `[nombre-del-flow-principal].ts`: [Descripción breve del flow]
- [Otros flows si aplican]

### 6.3 Estructura de Datos

> Describir las colecciones/tablas principales, con sus campos clave. Ejemplo de formato:

**Colección / Tabla:** `[nombre-coleccion-principal]`

```ts
{
  id: string;
  // Campos principales
  name: string;
  description?: string;
  status: "Activo" | "Pendiente" | "Inactivo";
  createdAt: Timestamp;
  // Campos de configuración / branding / stats
}
```

**Colección / Tabla:** `[nombre-coleccion-secundaria]`

```ts
{
  id: string;
  parentId: string; // relación con entidad principal
  type: "image" | "document" | "url" | "text";
  // Otros campos relevantes
}
```

### 6.4 Metaprompt / Prompting

> Incluir aquí un ejemplo de metaprompt o estructura de prompt que combine:
>
> - Prompt del usuario
> - Contexto de negocio / marca
> - Instrucciones de estilo
> - Reglas de calidad y restricciones

```txt
[Describir aquí la plantilla de metaprompt que utilizará el agente]
```

---

## 7. Flujo de Usuario

### 7.1 Flujo Principal

1. [Paso 1 del usuario]
2. [Paso 2]
3. [Paso 3]
4. [...]

### 7.2 Flujos Secundarios (opcional)

- [Flujo de gestión de recursos]
- [Flujo de consulta / reporting]

---

## 8. Métricas de Éxito

### 8.1 KPIs de Producto

- [Métrica de adopción]
- [Métrica de satisfacción]
- [Métrica de calidad percibida]

### 8.2 KPIs Técnicos

- [Uptime]
- [Latencia]
- [Error rate]
- [Costo por operación/unidad]

### 8.3 KPIs de Negocio

- [Ahorro de costos]
- [Incremento de velocidad o throughput]
- [Retorno de inversión estimado]

> Si aún no se cuentan con KPIs claros, dejar explícito: "Las métricas de éxito aún no se han definido; se establecerán en conjunto con negocio y tecnología".

---

## 9. Roadmap

**Fase 1: MVP ([Trimestre / Fecha])**

- [Feature / entregable #1]
- [Feature / entregable #2]

**Fase 2: Mejoras ([Trimestre / Fecha])**

- [Mejora 1]
- [Mejora 2]

**Fase 3: Avanzado ([Trimestre / Fecha])**

- [Funcionalidad avanzada 1]
- [Integraciones / automatizaciones]

> Si no hay roadmap aún, indicarlo: "El roadmap detallado aún no se ha definido".

---

## 10. Riesgos y Mitigaciones

| Riesgo     | Probabilidad      | Impacto           | Mitigación                 |
| ---------- | ----------------- | ----------------- | -------------------------- |
| [Riesgo 1] | [Baja/Media/Alta] | [Bajo/Medio/Alto] | [Estrategia de mitigación] |
| [Riesgo 2] | [Baja/Media/Alta] | [Bajo/Medio/Alto] | [Estrategia de mitigación] |

> Si aún no se han revisado riesgos, escribir: "Aún no se ha realizado un análisis formal de riesgos".

---

## 11. Dependencias

### 11.1 Externas

- [APIs, vendors, servicios cloud, modelos de IA, etc.]

### 11.2 Internas

- [Otros equipos / sistemas / módulos de la organización]

---

## 12. Aprobaciones

| Rol           | Nombre   | Fecha   | Firma   |
| ------------- | -------- | ------- | ------- |
| Product Owner | [Nombre] | [Fecha] | [Firma] |
| Tech Lead     | [Nombre] | [Fecha] | [Firma] |
| [Otro rol]    | [Nombre] | [Fecha] | [Firma] |

---

## 13. Historial de Cambios

| Versión | Fecha   | Autor    | Cambios                        |
| ------- | ------- | -------- | ------------------------------ |
| 1.0     | [Fecha] | [Nombre] | Documento inicial              |
| 1.1     | [Fecha] | [Nombre] | [Descripción breve de cambios] |
