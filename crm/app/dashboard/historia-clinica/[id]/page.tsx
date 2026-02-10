"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HtmlContent } from "@/components/ui/html-content";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Pill,
  Trash,
  User,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useAttachments } from "@/hooks/useAttachments";
import { AttachmentUpload, AttachmentList } from "@/components/attachments";

// Interfaz para prescripciones
interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function MedicalRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { medicalRecords, updateMedicalRecord, deleteMedicalRecord } =
    useAppContext();
  const { toast } = useToast();

  // Desenvolver los params usando React.use()
  const { id } = use(params);

  const record = medicalRecords.find((r) => r.id === id);

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pendiente");
  const [diagnosis, setDiagnosis] = useState("");
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);

  // Inicializar estados cuando el registro esté disponible
  useEffect(() => {
    if (record) {
      setNotes(record.notes || "");
      setStatus(record.status || "Pendiente");
      setDiagnosis(record.diagnosis || "");
    }
  }, [record]);

  // Hook para manejo de attachments
  const {
    attachments,
    loading: attachmentsLoading,
    uploading,
    error: attachmentsError,
    uploadProgress,
    uploadAttachments,
    downloadAttachment,
    deleteAttachment,
    clearError,
  } = useAttachments(id);

  // Funciones para manejar attachments
  const handleUploadSuccess = async (files: File[]) => {
    try {
      const result = await uploadAttachments(files);
      toast({
        title: "Archivos subidos",
        description: `${files.length} archivo(s) subido(s) exitosamente`,
      });
      return result;
    } catch (error) {
      toast({
        title: "Error al subir archivos",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDownloadFile = async (filename: string) => {
    try {
      await downloadAttachment(filename);
    } catch (error) {
      toast({
        title: "Error al descargar archivo",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId);
      toast({
        title: "Archivo eliminado",
        description: "El archivo fue eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error al eliminar archivo",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  // Función para obtener iniciales del nombre y apellido
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-bold">Registro médico no encontrado</h1>
        <p className="text-muted-foreground">
          El registro médico que buscas no existe o ha sido eliminado.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/historia-clinica">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Historia Clínica
          </Link>
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      // Validar que los datos no estén vacíos
      if (!notes.trim() && !diagnosis.trim()) {
        toast({
          title: "Error",
          description: "Debe completar al menos las notas o el diagnóstico",
          variant: "destructive",
        });
        return;
      }

      // Crear objeto de datos con solo los campos que pueden cambiar
      const updateData: any = {};

      // Solo incluir campos que han cambiado
      if (notes.trim() !== (record.notes || "")) {
        updateData.notes = notes.trim();
      }

      if (diagnosis.trim() !== (record.diagnosis || "")) {
        // Por ahora, enviar solo el texto plano para evitar problemas con HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = diagnosis.trim();
        updateData.diagnosis = tempDiv.textContent || diagnosis.trim();
      }

      if (status !== record.status) {
        updateData.status = status as "Completo" | "Pendiente";
      }

      // Si no hay cambios, no hacer nada
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Sin cambios",
          description: "No hay cambios para guardar",
        });
        return;
      }

      const result = await updateMedicalRecord(record.id, updateData);

      setIsEditingDiagnosis(false);

      // Mostrar notificación de éxito
      toast({
        title: "Éxito",
        description: "Registro médico actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar el registro médico",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMedicalRecord(record.id);
      toast({
        title: "Éxito",
        description: "Registro médico eliminado correctamente",
      });
      router.push("/dashboard/historia-clinica");
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el registro médico",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-9xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/historia-clinica">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalles del Registro Médico
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/citas/nueva?patientId=${record.patient?.id || record.patient_id}&returnTo=historia-clinica&recordId=${record.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Seguimiento
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/recetario?patientId=${record.patient?.id || record.patient_id}&returnTo=historia-clinica&recordId=${record.id}&diagnosis=${encodeURIComponent(record.diagnosis || '')}`}>
              <Pill className="mr-2 h-4 w-4" />
              Nueva Prescripción
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará
                  permanentemente este registro médico.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Información del Paciente</CardTitle>
            <CardDescription>
              Detalles del paciente asociado a este registro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-medium">
                  {getInitials(
                    record.patient?.name || record.patient_name || "Paciente"
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {record.patient?.name ||
                    record.patient_name ||
                    "Paciente desconocido"}
                </h3>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link
                    href={`/dashboard/pacientes/${
                      record.patient?.id || record.patient_id
                    }`}
                  >
                    <User className="mr-1 h-3 w-3" />
                    Ver perfil completo
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Información de la Consulta</CardTitle>
            <CardDescription>Detalles generales de la consulta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="mr-1 h-3 w-3" /> Fecha
                </span>
                <span>
                  {record.record_date || record.date || record.created_at
                    ? new Date(
                        record.record_date || record.date || record.created_at
                      ).toLocaleDateString("es-ES")
                    : "Sin fecha"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center">
                  <User className="mr-1 h-3 w-3" /> Doctor
                </span>
                <span>
                  {record.doctor?.name ||
                    record.doctor_name ||
                    record.doctor ||
                    "Doctor desconocido"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center">
                  <FileText className="mr-1 h-3 w-3" /> Tipo
                </span>
                <span>{record.record_type || record.type || "Sin tipo"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3 w-3" /> Estado
                </span>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completo">Completo</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="diagnosis">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescripciones</TabsTrigger>
          <TabsTrigger value="attachments">Adjuntos</TabsTrigger>
        </TabsList>
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico</CardTitle>
              <CardDescription>Diagnóstico y notas del médico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Diagnóstico Principal</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingDiagnosis(!isEditingDiagnosis)}
                  >
                    {isEditingDiagnosis ? "Cancelar" : "Editar"}
                  </Button>
                </div>

                {isEditingDiagnosis ? (
                  <div className="space-y-3">
                    <RichTextEditor
                      value={diagnosis}
                      onChange={setDiagnosis}
                      placeholder="Ingrese el diagnóstico detallado..."
                      className="min-h-[200px]"
                    />
                  </div>
                ) : diagnosis ? (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <HtmlContent content={diagnosis} />
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sin diagnóstico</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Notas Médicas</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añadir notas médicas..."
                  rows={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescripciones</CardTitle>
              <CardDescription>
                Medicamentos recetados al paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {record.prescriptions && record.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {record.prescriptions.map(
                    (prescription: Prescription, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Pill className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-semibold">
                                {prescription.medication}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {prescription.dosage} - {prescription.frequency}
                              </p>
                              <p className="text-sm">
                                Duración: {prescription.duration}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No hay prescripciones registradas.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attachments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Archivos Adjuntos</CardTitle>
                <CardDescription>
                  Sube documentos, resultados de laboratorio, imágenes médicas y
                  otros archivos relacionados con este registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Componente de Upload */}
                <AttachmentUpload
                  medicalRecordId={id}
                  onUploadSuccess={handleUploadSuccess}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                />

                {/* Mostrar error si existe */}
                {attachmentsError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error con archivos adjuntos
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          {attachmentsError}
                        </p>
                        <button
                          onClick={clearError}
                          className="text-sm text-red-600 underline hover:text-red-500 mt-2"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Attachments */}
                <AttachmentList
                  attachments={attachments}
                  loading={attachmentsLoading}
                  onDownload={handleDownloadFile}
                  onDelete={handleDeleteFile}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
