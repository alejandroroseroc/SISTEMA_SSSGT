export const ESTANDARES = [
    {
        titulo: "Responsable del SG-SST",
        desc: "Define quién en tu empresa se encargará de liderar y hacer seguimiento al sistema de seguridad y salud.",
        items: [
            "Designar formalmente a una persona responsable del SG-SST",
            "Documentar la asignación con carta o acta firmada",
            "Verificar que el responsable tenga conocimiento básico en el tema",
            "Comunicar a todos los trabajadores quién es el responsable",
            "Definir las funciones y responsabilidades de esa persona",
        ],
        evidencia: [
            "Carta de designación firmada",
            "Acta de reunión de socialización",
            "Funciones documentadas en el cargo",
        ],
    },
    {
        titulo: "Afiliaciones y requisitos legales básicos",
        desc: "Asegúrate de que todos tus trabajadores estén cubiertos con los seguros y afiliaciones obligatorias por ley.",
        items: [
            "Afiliar a todos los trabajadores a una Administradora de Riesgos Laborales (ARL)",
            "Afiliar a todos a EPS (salud) y AFP (pensión)",
            "Pagar oportunamente los aportes al sistema de seguridad social",
            "Registrar la empresa ante la ARL según clase de riesgo",
            "Tener copia de los certificados de afiliación",
        ],
        evidencia: [
            "Certificados de afiliación ARL, EPS y AFP",
            "Comprobantes de pago de nómina",
            "Planillas de aportes",
        ],
    },
    {
        titulo: "Capacitación e inducción",
        desc: "Todos los trabajadores deben recibir formación sobre los riesgos de su trabajo y cómo protegerse.",
        items: [
            "Realizar inducción sobre SG-SST a todos los trabajadores nuevos",
            "Capacitar en identificación de peligros en el puesto de trabajo",
            "Enseñar el uso correcto de elementos de protección personal (EPP)",
            "Capacitar en procedimientos de emergencia y evacuación",
            "Registrar las capacitaciones con firmas de asistencia",
            "Realizar al menos una capacitación por año",
        ],
        evidencia: [
            "Listas de asistencia firmadas",
            "Material de capacitación (diapositivas, folletos)",
            "Registro fotográfico de las sesiones",
        ],
    },
    {
        titulo: "Plan anual de trabajo",
        desc: "Planifica las actividades de seguridad que realizarás durante el año para mejorar las condiciones de trabajo.",
        items: [
            "Definir los objetivos del SG-SST para el año",
            "Listar las actividades planeadas con fechas tentativas",
            "Asignar un responsable para cada actividad",
            "Establecer indicadores para medir el cumplimiento",
            "Revisar y actualizar el plan cada año",
            "Compartir el plan con los trabajadores",
        ],
        evidencia: [
            "Documento de Plan Anual de Trabajo",
            "Cronograma de actividades",
            "Acta de socialización del plan",
        ],
    },
    {
        titulo: "Evaluaciones de salud ocupacional",
        desc: "Asegura que tus trabajadores tengan los exámenes médicos necesarios según su cargo y los riesgos que enfrentan.",
        items: [
            "Identificar qué cargos requieren examen médico de ingreso",
            "Realizar examen médico de ingreso a nuevos empleados",
            "Guardar los resultados de los exámenes de forma confidencial",
            "Programar exámenes periódicos cuando aplique",
            "Actuar sobre las recomendaciones médicas recibidas",
        ],
        evidencia: [
            "Resultados de exámenes médicos ocupacionales",
            "Concepto de aptitud médica",
            "Contrato con IPS o médico ocupacional",
        ],
    },
    {
        titulo: "Identificación de peligros y evaluación de riesgos",
        desc: "Reconoce qué situaciones en tu empresa pueden causar accidentes o enfermedades, y evalúa qué tan graves son.",
        items: [
            "Hacer una inspección visual de las instalaciones y puestos de trabajo",
            "Listar todos los peligros identificados (físicos, químicos, ergonómicos, etc.)",
            "Evaluar la probabilidad y consecuencias de cada riesgo",
            "Priorizar los riesgos más críticos",
            "Actualizar la matriz de riesgos cuando cambien las condiciones",
            "Socializar los riesgos encontrados con los trabajadores",
            "Documentar todo en una matriz de peligros y riesgos",
        ],
        evidencia: [
            "Matriz de peligros y riesgos",
            "Registro fotográfico de inspecciones",
            "Acta de socialización con trabajadores",
        ],
    },
    {
        titulo: "Medidas de prevención y control",
        desc: "Implementa acciones concretas para reducir o eliminar los riesgos identificados en tu empresa.",
        items: [
            "Definir medidas de control para cada riesgo identificado",
            "Priorizar eliminación del riesgo antes que protección personal",
            "Dotar a los trabajadores de los EPP necesarios según su cargo",
            "Verificar que los EPP sean usados correctamente",
            "Hacer mantenimiento preventivo a equipos y herramientas",
            "Señalizar las zonas de riesgo dentro de las instalaciones",
            "Revisar las medidas de control al menos una vez al año",
            "Registrar las medidas implementadas y su efectividad",
        ],
        evidencia: [
            "Inventario de EPP entregados (firma de recibido)",
            "Registros de mantenimiento de equipos",
            "Fotografías de señalización instalada",
        ],
    },
];

export const RIESGO_MAP = {
    comercio: 2,
    restaurante: 2,
    peluqueria: 2,
    oficina: 1,
    transporte: 4,
    construccion: 5,
    salud: 3,
    educacion: 2,
    agricultura: 3,
    industria: 3,
};

export const INITIAL_PROGRESS = [
    [true, true, false, false, false], // 2/5
    [true, false, false, false, false], // 1/5
    [false, false, false, false, false, false],
    [false, false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
];