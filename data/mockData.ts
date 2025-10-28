import { User, Project } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', fullName: 'Ana Torres', email: 'ana.torres@utparral.edu.mx' },
  { id: 'u2', fullName: 'Luis Vega', email: 'luis.vega@utparral.edu.mx' },
  { id: 'u3', fullName: 'Carla Solis', email: 'carla.solis@utparral.edu.mx' },
  { id: 'u4', fullName: 'Pedro Marquez', email: 'pedro.marquez@utparral.edu.mx' },
];

const today = new Date();
const oldDate = new Date();
oldDate.setDate(today.getDate() - 10); // Set date to 10 days ago

export const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'Sistema de Riego Automatizado con IoT',
    description: 'Este proyecto desarrolla un sistema de riego inteligente que utiliza sensores de humedad del suelo y datos meteorológicos para optimizar el uso del agua en la agricultura. La plataforma se controla a través de una aplicación web y móvil, permitiendo a los agricultores monitorear y gestionar sus cultivos de forma remota. Se utilizaron Arduino, Raspberry Pi y sensores DHT11.',
    category: 'Software',
    owner: mockUsers[0],
    participants: [mockUsers[0], mockUsers[1]],
    files: [{ id: 'f1', name: 'documentacion_riego.pdf', url: '#', type: 'application/pdf' }],
    comments: [
      { id: 'c1', user: mockUsers[2], content: '¡Excelente proyecto! Muy bien documentado.', createdAt: '2024-05-10T10:00:00Z' },
      { id: 'c2', user: mockUsers[3], content: '¿Qué tipo de sensores usaron para la humedad?', createdAt: '2024-05-11T12:30:00Z' },
    ],
    originalityScore: 88,
    originalityJustification: 'El proyecto combina tecnologías IoT de manera efectiva para una aplicación práctica y relevante, aunque existen soluciones similares en el mercado.',
    createdAt: oldDate.toISOString(), // More than 5 days ago, not editable
  },
  {
    id: 'p2',
    title: 'Brazo Robótico para Clasificación de Objetos',
    description: 'Diseño y construcción de un brazo robótico de 4 grados de libertad controlado por un sistema de visión por computadora. El sistema utiliza una cámara y algoritmos de reconocimiento de imágenes con OpenCV para identificar y clasificar objetos por color y forma, depositándolos en contenedores específicos. El objetivo es automatizar tareas repetitivas en una línea de producción.',
    category: 'Mecatrónica',
    owner: mockUsers[2],
    participants: [mockUsers[2]],
    files: [
        { id: 'f2', name: 'planos_brazo.zip', url: '#', type: 'application/zip' },
        { id: 'f3', name: 'presentacion.pptx', url: '#', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
    ],
    comments: [],
    originalityScore: 95,
    originalityJustification: 'La integración de visión por computadora con un brazo robótico de diseño propio demuestra un alto nivel de innovación y complejidad técnica.',
    createdAt: '2024-04-20T09:00:00Z', // Very old, not editable
  },
   {
    id: 'p3',
    title: 'Plataforma de E-learning Adaptativo',
    description: 'Desarrollo de una plataforma web de aprendizaje en línea que personaliza el contenido educativo para cada estudiante utilizando algoritmos de machine learning. El sistema analiza el rendimiento del estudiante y adapta las lecciones y ejercicios para reforzar las áreas de debilidad. Frontend en React y Backend en Node.js con Express.',
    category: 'Software',
    owner: mockUsers[0],
    participants: [mockUsers[0], mockUsers[3], mockUsers[1]],
    files: [{ id: 'f4', name: 'reporte_final.pdf', url: '#', type: 'application/pdf' }],
    comments: [
      { id: 'c3', user: mockUsers[2], content: 'Muy interesante el enfoque adaptativo. ¿Qué modelo de ML utilizaron?', createdAt: '2024-05-21T18:00:00Z' }
    ],
    originalityScore: 92,
    originalityJustification: 'La aplicación de machine learning para la personalización del aprendizaje es un campo avanzado y relevante, mostrando una fuerte innovación conceptual.',
    createdAt: today.toISOString(), // Created today, so it is editable
  },
];
