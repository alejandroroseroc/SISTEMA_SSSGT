const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ESTANDARES = [
  {
    numero: 1,
    titulo: 'Responsable del SG-SST',
    descripcion: 'Define quién en tu empresa se encargará de liderar y hacer seguimiento al sistema de seguridad y salud.',
    items: [
      { texto: 'Designar formalmente a una persona responsable del SG-SST', evidencias: ['Carta de designación firmada', 'Acta de reunión de socialización', 'Funciones documentadas en el cargo'] },
      { texto: 'Documentar la asignación con carta o acta firmada', evidencias: ['Carta de designación firmada'] },
      { texto: 'Verificar que el responsable tenga conocimiento básico en el tema', evidencias: ['Certificado de capacitación o formación'] },
      { texto: 'Comunicar a todos los trabajadores quién es el responsable', evidencias: ['Acta de reunión de socialización'] },
      { texto: 'Definir las funciones y responsabilidades de esa persona', evidencias: ['Funciones documentadas en el cargo'] },
    ],
  },
  {
    numero: 2,
    titulo: 'Afiliaciones y requisitos legales básicos',
    descripcion: 'Asegúrate de que todos tus trabajadores estén cubiertos con los seguros y afiliaciones obligatorias por ley.',
    items: [
      { texto: 'Afiliar a todos los trabajadores a una Administradora de Riesgos Laborales (ARL)', evidencias: ['Certificados de afiliación ARL, EPS y AFP', 'Comprobantes de pago de nómina'] },
      { texto: 'Afiliar a todos a EPS (salud) y AFP (pensión)', evidencias: ['Certificados de afiliación ARL, EPS y AFP'] },
      { texto: 'Pagar oportunamente los aportes al sistema de seguridad social', evidencias: ['Planillas de aportes'] },
      { texto: 'Registrar la empresa ante la ARL según clase de riesgo', evidencias: ['Certificados de afiliación ARL'] },
      { texto: 'Tener copia de los certificados de afiliación', evidencias: ['Certificados de afiliación ARL, EPS y AFP'] },
    ],
  },
  {
    numero: 3,
    titulo: 'Capacitación e inducción',
    descripcion: 'Todos los trabajadores deben recibir formación sobre los riesgos de su trabajo y cómo protegerse.',
    items: [
      { texto: 'Realizar inducción sobre SG-SST a todos los trabajadores nuevos', evidencias: ['Listas de asistencia firmadas', 'Material de capacitación'] },
      { texto: 'Capacitar en identificación de peligros en el puesto de trabajo', evidencias: ['Listas de asistencia firmadas'] },
      { texto: 'Enseñar el uso correcto de elementos de protección personal (EPP)', evidencias: ['Registro fotográfico de las sesiones'] },
      { texto: 'Capacitar en procedimientos de emergencia y evacuación', evidencias: ['Listas de asistencia firmadas'] },
      { texto: 'Registrar las capacitaciones con firmas de asistencia', evidencias: ['Listas de asistencia firmadas'] },
      { texto: 'Realizar al menos una capacitación por año', evidencias: ['Cronograma de capacitaciones'] },
    ],
  },
  {
    numero: 4,
    titulo: 'Plan anual de trabajo',
    descripcion: 'Planifica las actividades de seguridad que realizarás durante el año para mejorar las condiciones de trabajo.',
    items: [
      { texto: 'Definir los objetivos del SG-SST para el año', evidencias: ['Documento de Plan Anual de Trabajo'] },
      { texto: 'Listar las actividades planeadas con fechas tentativas', evidencias: ['Cronograma de actividades'] },
      { texto: 'Asignar un responsable para cada actividad', evidencias: ['Documento de Plan Anual de Trabajo'] },
      { texto: 'Establecer indicadores para medir el cumplimiento', evidencias: ['Documento de Plan Anual de Trabajo'] },
      { texto: 'Revisar y actualizar el plan cada año', evidencias: ['Acta de revisión anual'] },
      { texto: 'Compartir el plan con los trabajadores', evidencias: ['Acta de socialización del plan'] },
    ],
  },
  {
    numero: 5,
    titulo: 'Evaluaciones de salud ocupacional',
    descripcion: 'Asegura que tus trabajadores tengan los exámenes médicos necesarios según su cargo y los riesgos que enfrentan.',
    items: [
      { texto: 'Identificar qué cargos requieren examen médico de ingreso', evidencias: ['Resultados de exámenes médicos ocupacionales'] },
      { texto: 'Realizar examen médico de ingreso a nuevos empleados', evidencias: ['Concepto de aptitud médica'] },
      { texto: 'Guardar los resultados de los exámenes de forma confidencial', evidencias: ['Resultados de exámenes médicos ocupacionales'] },
      { texto: 'Programar exámenes periódicos cuando aplique', evidencias: ['Contrato con IPS o médico ocupacional'] },
      { texto: 'Actuar sobre las recomendaciones médicas recibidas', evidencias: ['Concepto de aptitud médica'] },
    ],
  },
  {
    numero: 6,
    titulo: 'Identificación de peligros y evaluación de riesgos',
    descripcion: 'Reconoce qué situaciones en tu empresa pueden causar accidentes o enfermedades, y evalúa qué tan graves son.',
    items: [
      { texto: 'Hacer una inspección visual de las instalaciones y puestos de trabajo', evidencias: ['Registro fotográfico de inspecciones'] },
      { texto: 'Listar todos los peligros identificados (físicos, químicos, ergonómicos, etc.)', evidencias: ['Matriz de peligros y riesgos'] },
      { texto: 'Evaluar la probabilidad y consecuencias de cada riesgo', evidencias: ['Matriz de peligros y riesgos'] },
      { texto: 'Priorizar los riesgos más críticos', evidencias: ['Matriz de peligros y riesgos'] },
      { texto: 'Actualizar la matriz de riesgos cuando cambien las condiciones', evidencias: ['Matriz de peligros y riesgos'] },
      { texto: 'Socializar los riesgos encontrados con los trabajadores', evidencias: ['Acta de socialización con trabajadores'] },
      { texto: 'Documentar todo en una matriz de peligros y riesgos', evidencias: ['Matriz de peligros y riesgos'] },
    ],
  },
  {
    numero: 7,
    titulo: 'Medidas de prevención y control',
    descripcion: 'Implementa acciones concretas para reducir o eliminar los riesgos identificados en tu empresa.',
    items: [
      { texto: 'Definir medidas de control para cada riesgo identificado', evidencias: ['Inventario de EPP entregados (firma de recibido)'] },
      { texto: 'Priorizar eliminación del riesgo antes que protección personal', evidencias: ['Registros de mantenimiento de equipos'] },
      { texto: 'Dotar a los trabajadores de los EPP necesarios según su cargo', evidencias: ['Inventario de EPP entregados (firma de recibido)'] },
      { texto: 'Verificar que los EPP sean usados correctamente', evidencias: ['Registro fotográfico de uso de EPP'] },
      { texto: 'Hacer mantenimiento preventivo a equipos y herramientas', evidencias: ['Registros de mantenimiento de equipos'] },
      { texto: 'Señalizar las zonas de riesgo dentro de las instalaciones', evidencias: ['Fotografías de señalización instalada'] },
      { texto: 'Revisar las medidas de control al menos una vez al año', evidencias: ['Acta de revisión anual'] },
      { texto: 'Registrar las medidas implementadas y su efectividad', evidencias: ['Registro de medidas de control'] },
    ],
  },
];

async function main() {
  console.log('Seeding estándares…');

  for (const est of ESTANDARES) {
    const estandar = await prisma.estandar.upsert({
      where: { numero: est.numero },
      update: { titulo: est.titulo, descripcion: est.descripcion },
      create: { numero: est.numero, titulo: est.titulo, descripcion: est.descripcion },
    });

    for (let i = 0; i < est.items.length; i++) {
      const it = est.items[i];
      const existing = await prisma.item.findFirst({
        where: { estandarId: estandar.id, orden: i },
      });
      if (!existing) {
        await prisma.item.create({
          data: { texto: it.texto, evidencias: it.evidencias, orden: i, estandarId: estandar.id },
        });
      }
    }
  }

  console.log('Seed completado: 7 estándares insertados.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
