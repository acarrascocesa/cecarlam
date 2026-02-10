import type { Message } from "@/context/app-context"

export const initialMessages: Message[] = [
  // Mensajes de la Clínica Abreu (Dr. Luis)
  {
    id: "1",
    patient: {
      id: "luis_abreu_1",
      name: "María González",
      image: "/woman-face-2.png"
    },
    date: "2024-07-25",
    content: "Buenos días doctor, tengo una consulta sobre mi medicación. ¿Puedo tomar el Losartán en la mañana en lugar de la noche?",
    status: "Respondido",
    type: "Consulta médica",
    responses: [
      {
        id: "resp1",
        date: "2024-07-25",
        content: "Hola María, sí puedes tomar el Losartán en la mañana sin problema. Lo importante es que sea a la misma hora todos los días. ¿Hay algún motivo específico por el que prefieres la mañana?",
        sender: "doctor"
      },
      {
        id: "resp2",
        date: "2024-07-25",
        content: "Gracias doctor. Es que en la noche a veces se me olvida. En la mañana con el desayuno es más fácil recordarlo.",
        sender: "patient"
      }
    ],
    clinicId: "luis_1"
  },
  {
    id: "2",
    patient: {
      id: "luis_abreu_2",
      name: "Juan Carlos Rodríguez",
      image: "/man-face.png"
    },
    date: "2024-07-24",
    content: "Doctor, mis niveles de glucosa han estado un poco altos últimamente. ¿Debería ajustar la dosis de la Metformina?",
    status: "Respondido",
    type: "Consulta médica",
    responses: [
      {
        id: "resp3",
        date: "2024-07-24",
        content: "Hola Juan Carlos, ¿podrías decirme qué valores has tenido en los últimos días? También, ¿has cambiado algo en tu dieta o actividad física?",
        sender: "doctor"
      },
      {
        id: "resp4",
        date: "2024-07-24",
        content: "He tenido entre 140-160 en ayunas. No he cambiado mi dieta, pero he estado más estresado en el trabajo.",
        sender: "patient"
      },
      {
        id: "resp5",
        date: "2024-07-24",
        content: "Entiendo. El estrés puede afectar los niveles de glucosa. Por ahora mantén la dosis actual y trata de manejar el estrés. Si en una semana sigues con valores altos, me avisas para ajustar la medicación.",
        sender: "doctor"
      }
    ],
    clinicId: "luis_1"
  },
  // Mensajes de la Clínica de Inmunología (Dra. Linda)
  {
    id: "3",
    patient: {
      id: "linda_inmuno_1",
      name: "Ana Sofía López",
      image: "/woman-face-4.png"
    },
    date: "2024-07-26",
    content: "Hola doctora, tengo una cita programada para mañana pero me siento muy mal con el asma. ¿Puedo adelantar la cita?",
    status: "Respondido",
    type: "Urgencia",
    responses: [
      {
        id: "resp6",
        date: "2024-07-26",
        content: "Hola Ana Sofía, por supuesto. ¿Qué síntomas tienes exactamente? ¿Estás usando el inhalador?",
        sender: "doctor"
      },
      {
        id: "resp7",
        date: "2024-07-26",
        content: "Sí, estoy usando el Salbutamol pero no me está haciendo mucho efecto. Tengo mucha dificultad para respirar y sibilancias.",
        sender: "patient"
      },
      {
        id: "resp8",
        date: "2024-07-26",
        content: "Ven a la clínica ahora mismo. Te veo en 30 minutos. Mientras tanto, mantén la calma y sigue usando el inhalador cada 4 horas.",
        sender: "doctor"
      }
    ],
    clinicId: "linda_1"
  },
  {
    id: "4",
    patient: {
      id: "linda_inmuno_2",
      name: "Carlos Enrique Ramírez",
      image: "/man-face-4.png"
    },
    date: "2024-07-25",
    content: "Doctora, las pruebas de alergia salieron positivas para polen y ácaros. ¿Qué medidas puedo tomar en casa?",
    status: "Respondido",
    type: "Consulta médica",
    responses: [
      {
        id: "resp15",
        date: "2024-07-25",
        content: "Hola Carlos, para los ácaros: usa fundas anti-ácaros en almohadas y colchón, lava la ropa de cama semanalmente con agua caliente, y mantén la humedad baja en casa. Para el polen: evita salir en días ventosos y usa gafas de sol.",
        sender: "doctor"
      },
      {
        id: "resp16",
        date: "2024-07-25",
        content: "Gracias doctora. ¿Y el tratamiento con la Cetirizina y el spray nasal lo mantengo?",
        sender: "patient"
      },
      {
        id: "resp17",
        date: "2024-07-25",
        content: "Sí, mantén el tratamiento. La Cetirizina por la noche y el spray nasal por la mañana. Si los síntomas mejoran, podemos reducir gradualmente la dosis.",
        sender: "doctor"
      }
    ],
    clinicId: "linda_1"
  },
  // Mensajes del Centro de Alergias (Dra. Linda)
  {
    id: "5",
    patient: {
      id: "linda_alergias_1",
      name: "Luis Miguel Fernández",
      image: "/man-face-3.png"
    },
    date: "2024-07-26",
    content: "Doctora, tuve una migraña muy fuerte ayer que duró todo el día. El Sumatriptán no me hizo efecto. ¿Qué puedo hacer?",
    status: "Respondido",
    type: "Consulta médica",
    responses: [
      {
        id: "resp12",
        date: "2024-07-26",
        content: "Hola Luis, las migrañas que no responden al tratamiento pueden ser graves. ¿Tienes algún síntoma neurológico como visión borrosa o entumecimiento?",
        sender: "doctor"
      },
      {
        id: "resp13",
        date: "2024-07-26",
        content: "No, solo el dolor de cabeza muy intenso. Ya se me pasó, pero me preocupa que vuelva a pasar.",
        sender: "patient"
      },
      {
        id: "resp14",
        date: "2024-07-26",
        content: "Entiendo tu preocupación. En tu próxima cita vamos a evaluar si necesitas un tratamiento preventivo. Por ahora, evita los desencadenantes como el estrés, la falta de sueño y ciertos alimentos.",
        sender: "doctor"
      }
    ],
    clinicId: "linda_2"
  },
  // Mensaje pendiente
  {
    id: "6",
    patient: {
      id: "luis_corazones_1",
      name: "Roberto Antonio Martínez",
      image: "/man-face-2.png"
    },
    date: "2024-07-27",
    content: "Doctor, he estado tomando el Metotrexato por 2 semanas y siento náuseas. ¿Es normal?",
    status: "Pendiente",
    type: "Consulta médica",
    responses: [],
    clinicId: "luis_2"
  }
] 