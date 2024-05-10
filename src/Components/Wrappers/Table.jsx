import { useState, useEffect } from "react";
import eliminar from "../../assets/img/trash and edit/eliminar.png";
import lapiz from "../../assets/img/trash and edit/lapiz.png";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import { userAuth } from "../../Context/UserContext";
import { doctorAuth } from "../../Context/DoctorContext";
import { saveAs } from "file-saver";

// Establecer la zona horaria por defecto
moment.tz.setDefault("America/Argentina/Buenos_Aires");

const Table = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [doctoresCreate, setDoctoresCreate] = useState([]);
  const [citas, setCitas] = useState([]);

  const [filteredCitas, setFilteredCitas] = useState([]);
  const [nombresApellidosDoctores, setNombresApellidosDoctores] = useState({});
  const [nombresApellidosUsuarios, setNombresApellidosUsuarios] = useState({});
  // Estado para la búsqueda global
  const [busqueda, setBusqueda] = useState("");

  const { signup: signupUser } = userAuth();
  const { signup: signupDoctor } = doctorAuth();

  const especialidadesMedicas = [
    "Anestesiología",
    "Cardiología",
    "Dermatología",
    "Endocrinología",
    "Gastroenterología",
    "Geriatría",
    "Ginecología",
    "Hematología",
    "Infectología",
    "Medicina Familiar",
    "Medicina Interna",
    "Nefrología",
    "Neumología",
    "Neurología",
    "Obstetricia",
    "Odontología",
    "Oncología",
    "Oftalmología",
    "Ortopedia",
    "Otorrinolaringología",
    "Pediatría",
    "Psiquiatría",
    "Radiología",
    "Reumatología",
    "Traumatología",
    "Urología",
  ];

  // ----CRUD----

  // ----POST APPOINTMENTS----

  const [dni, setDni] = useState("");
  const [userId, setUserId] = useState(""); // Cambiar el valor inicial a una cadena vacía

  const handleDniChange = async (event) => {
    const enteredDni = event.target.value;
    setDni(enteredDni);

    try {
      const response = await axios.get(`https://backend-medical-rolling.vercel.app/api/getUserByDNI/${enteredDni}`);
      if (response.status === 200) {
        const user = response.data;
        if (user) {
          setUserId(user._id);
        } else {
          setUserId(""); // Si no se encuentra un usuario con el DNI especificado, reiniciar el ID del usuario a una cadena vacía
        }
      } else {
        console.error("Error fetching user by DNI:", response.data.message);
        setUserId(""); // En caso de error, reiniciar el ID del usuario a una cadena vacía
      }
    } catch (error) {
      console.error("Error fetching user by DNI:", error);
      setUserId(""); // En caso de error, reiniciar el ID del usuario a una cadena vacía
    }
  };

  const [doctorId, setDoctorId] = useState("");
  const [availableTimesCreate, setAvailableTimesCreate] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");

  const handleDoctorChangeCreate = (event) => {
    const selectedDoctorId = event.target.value;
    setDoctorId(selectedDoctorId);
  };

  const handleDateChangeCreate = async (date) => {
    try {
      const response = await axios.get("https://backend-medical-rolling.vercel.app/api/availableTimes", {
        params: {
          doctorId: doctorId,
          date: moment(date).format("YYYY-MM-DD"),
        },
      });
      setAvailableTimesCreate(response.data.availableTimes);
    } catch (error) {
      console.error("Error fetching available times:", error);
    }
  };

  const generateTimeOptionsCreate = () => {
    return availableTimesCreate.map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ));
  };

  const handleEspecialidadChange = (event) => {
    const selectedEspecialidad = event.target.value;
    setEspecialidadSeleccionada(selectedEspecialidad);
  };

  useEffect(() => {
    if (especialidadSeleccionada) {
      axios
        .get(`https://backend-medical-rolling.vercel.app/api/doctorsbyspecialty/${especialidadSeleccionada}`)
        .then((response) => {
          setDoctoresCreate(response.data);
        })
        .catch((error) => {
          console.error("Error al obtener los doctores:", error);
        });
    }
  }, [especialidadSeleccionada]);

  const postAppointment = async (formData) => {
    try {
      const response = await axios.post("https://backend-medical-rolling.vercel.app/api/createappointment/", formData);
      return response.data; // Devuelve los datos de la cita creada si la solicitud es exitosa
    } catch (error) {
      console.error("Error al crear la cita:", error);
      throw new Error("Error al crear la cita");
    }
  };

  // ----GET USERS----
  useEffect(() => {
    // Llamar a la función para obtener los usuarios cuando el componente se monta
    obtenerUsuariosDesdeBackend();
  }, []);

  // Función para obtener los usuarios desde el backend
  async function obtenerUsuariosDesdeBackend() {
    try {
      const response = await axios.get("https://backend-medical-rolling.vercel.app/api/gettingusers");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener los usuarios desde el backend:", error);
    }
  }

  const filteredUsuarios = usuarios.filter((usuario) => {
    // Combinar nombre y apellido en una sola cadena
    const nombreCompleto = `${usuario.name} ${usuario.lastname}`.toLowerCase();

    // Verificar si las propiedades están definidas antes de llamar a toLowerCase()
    const dni = usuario.dni ? usuario.dni.toString().toLowerCase() : "";
    const area = usuario.area ? usuario.area.toString().toLowerCase() : "";
    const phone = usuario.phone ? usuario.phone.toString().toLowerCase() : "";

    return (
      (usuario._id && usuario._id.toLowerCase().includes(busqueda.toLowerCase())) ||
      (dni && dni.includes(busqueda.toLowerCase())) ||
      nombreCompleto.includes(busqueda.toLowerCase()) || // Buscar en el nombre completo
      (usuario.email && usuario.email.toLowerCase().includes(busqueda.toLowerCase())) ||
      (usuario.province && usuario.province.toLowerCase().includes(busqueda.toLowerCase())) ||
      (area && area.includes(busqueda.toLowerCase())) ||
      (phone && phone.includes(busqueda.toLowerCase())) ||
      (usuario.address && usuario.address.toLowerCase().includes(busqueda.toLowerCase())) ||
      (usuario.address && usuario.address.toLowerCase().includes(busqueda.toLowerCase())) ||
      (usuario.rol && usuario.rol.toLowerCase().includes(busqueda.toLowerCase()))

      // Agrega más campos de usuario si es necesario
    );
  });

  // ---Get appointments by user---

  const [userAppointments, setUserAppointments] = useState([]);
  const [error, setError] = useState(null);

  const fetchAppointmentsByUser = async (userId) => {
    try {
      // Realiza una solicitud GET al endpoint del backend para obtener las citas del usuario
      const response = await axios.get(`https://backend-medical-rolling.vercel.app/api/getappointmentbyuser/${userId}`);
      // Establece el estado con los datos de las citas del usuario
      setUserAppointments(response.data);
    } catch (error) {
      // Maneja cualquier error que ocurra durante la solicitud
      setError(error.response.data.message);
    }
  };

  // ---Get appointments by user---

  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const fetchAppointmentsByDoctor = async (doctorId) => {
    try {
      // Realiza una solicitud GET al endpoint del backend para obtener las citas del usuario
      const response = await axios.get(`https://backend-medical-rolling.vercel.app/api/getappointmentbydoctor/${doctorId}`);
      // Establece el estado con los datos de las citas del usuario
      setDoctorAppointments(response.data);
    } catch (error) {
      // Maneja cualquier error que ocurra durante la solicitud
      setError(error.response.data.message);
    }
  };

  // ----GET DOCTORS----

  useEffect(() => {
    // Llamar a la función para obtener los usuarios cuando el componente se monta
    obtenerDoctoresDesdeBackend();
  }, []);

  // Función para obtener los usuarios desde el backend
  async function obtenerDoctoresDesdeBackend() {
    try {
      const response = await axios.get("https://backend-medical-rolling.vercel.app/api/gettingdoctors");
      setDoctores(response.data);
    } catch (error) {
      console.error("Error al obtener los usuarios desde el backend:", error);
    }
  }

  const filteredDoctors = doctores.filter((doctor) => {
    // Combinar nombre y apellido en una sola cadena
    const nombreCompleto = `${doctor.name} ${doctor.lastname}`.toLowerCase();

    // Verificar si las propiedades están definidas antes de llamar a toLowerCase()
    const dni = doctor.dni ? doctor.dni.toString().toLowerCase() : "";
    const licenceNumber = doctor.licenceNumber ? doctor.licenceNumber.toString() : "";

    return (
      (doctor._id && doctor._id.toLowerCase().includes(busqueda.toLowerCase())) ||
      (dni && dni.includes(busqueda.toLowerCase())) ||
      nombreCompleto.includes(busqueda.toLowerCase()) || // Buscar en el nombre completo
      (doctor.email && doctor.email.toLowerCase().includes(busqueda.toLowerCase())) ||
      (doctor.specialty && doctor.specialty.toLowerCase().includes(busqueda.toLowerCase())) ||
      (licenceNumber && licenceNumber.includes(busqueda.toLowerCase()))
    );
  });

  // ----GET APPOINMENTS----

  // OBTENER NOMBRE DOCTOR Y NOMBRE USUARIO
  useEffect(() => {
    obtenerCitasDesdeBackend();
  }, [busqueda]);

  async function obtenerCitasDesdeBackend() {
    try {
      const response = await axios.get("https://backend-medical-rolling.vercel.app/api/gettingappointments");
      const citas = response.data;
      const { nombresApellidosDoctores, nombresApellidosUsuarios, filteredCitas } = await obtenerValorDoctor(citas);
      setFilteredCitas(filteredCitas);
      setNombresApellidosDoctores(nombresApellidosDoctores);
      setNombresApellidosUsuarios(nombresApellidosUsuarios);
    } catch (error) {
      console.error("Error al obtener las citas desde el backend:", error);
    }
  }

  async function obtenerValorDoctor(citas) {
    const idsDoctores = citas.map((cita) => cita.doctor);
    const idsUsuarios = citas.map((cita) => cita.user);
    const responseDoctores = await Promise.all(idsDoctores.map((idDoctor) => axios.get(`https://backend-medical-rolling.vercel.app/api/getonedoctor/${idDoctor}`)));
    const responseUsuarios = await Promise.all(idsUsuarios.map((idUsuario) => axios.get(`https://backend-medical-rolling.vercel.app/api/getoneuser/${idUsuario}`)));

    const nombresApellidosDoctores = responseDoctores.reduce((acc, response) => {
      const doctor = response.data;
      if (doctor) {
        acc[doctor._id] = `${doctor.name ?? ""} ${doctor.lastname ?? ""}`;
      }
      return acc;
    }, {});

    const nombresApellidosUsuarios = responseUsuarios.reduce((acc, response) => {
      const usuario = response.data;
      if (usuario) {
        acc[usuario._id] = `${usuario.name ?? ""} ${usuario.lastname ?? ""}`;
      }
      return acc;
    }, {});

    const filteredCitas = citas.filter((cita) => {
      const searchString = busqueda.toLowerCase();
      const nombreCompletoDoctor = (nombresApellidosDoctores[cita.doctor] ?? "").toLowerCase();
      const nombreCompletoUsuario = (nombresApellidosUsuarios[cita.user] ?? "").toLowerCase();
      const estado = typeof cita.state === "boolean" ? (cita.state ? "activa" : "inactiva") : cita.state.toLowerCase();

      // Obtener partes de la fecha para búsqueda
      const selectedDate = moment(cita.appointmentDate); // Obtener la fecha seleccionada del formulario

      // Obtener la fecha formateada para enviarla al backend
      const formattedDate = selectedDate.format("YYYY-MM-DD");

      return (
        cita._id.toLowerCase().includes(searchString) ||
        cita.user.toLowerCase().includes(searchString) ||
        nombreCompletoDoctor.includes(searchString) ||
        nombreCompletoUsuario.includes(searchString) ||
        formattedDate.includes(searchString) || // Buscar por fecha formateada
        estado.includes(searchString)
      );
    });

    return { nombresApellidosDoctores, nombresApellidosUsuarios, filteredCitas };
  }

  // ----DELETE USERS----

  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const handleCaptureUserId = (usuarioId) => {
    setUserIdToDelete(usuarioId);
  };

  const handleDeleteUserConfirm = () => {
    if (!userIdToDelete) {
      return;
    }

    axios
      .delete(`https://backend-medical-rolling.vercel.app/api/deleteusers/${userIdToDelete}`)
      .then((response) => {
        // Aquí puedes realizar acciones adicionales si es necesario, como mostrar un mensaje de éxito o actualizar la lista de usuarios
      })
      .catch((error) => {
        console.error("Error al eliminar usuario:", error);
        // Aquí puedes manejar el error, mostrar un mensaje de error, etc.
      })
      .finally(() => {
        // Después de enviar la solicitud, ocultar el modal de confirmación y mostrar el modal de éxito
        setShowDeleteModalUser(false);
        setShowSuccessModalUser(true);
        obtenerUsuariosDesdeBackend();
      });
  };

  // ----DELETE DOCTORS----

  const [doctorIdToDelete, setDoctorIdToDelete] = useState(null);

  const handleCaptureDoctorId = (doctorId) => {
    setDoctorIdToDelete(doctorId);
  };

  const handleDeleteDoctorConfirm = () => {
    if (!doctorIdToDelete) {
      return;
    }

    axios
      .delete(`https://backend-medical-rolling.vercel.app/api/deletedoctors/${doctorIdToDelete}`)
      .then((response) => {
        // Aquí puedes realizar acciones adicionales si es necesario, como mostrar un mensaje de éxito o actualizar la lista de usuarios
      })
      .catch((error) => {
        console.error("Error al eliminar doctor:", error);
        // Aquí puedes manejar el error, mostrar un mensaje de error, etc.
      })
      .finally(() => {
        // Después de enviar la solicitud, ocultar el modal de confirmación y mostrar el modal de éxito
        setShowDeleteModalDoctor(false);
        setShowSuccessModalDoctor(true);
        obtenerDoctoresDesdeBackend();
      });
  };

  // ----DELETE APPOINMENTS----

  const [citaIdToDelete, setCitaIdToDelete] = useState(null);

  const handleCaptureCitaId = (citaId) => {
    setCitaIdToDelete(citaId);
  };

  const handleDeleteCitaConfirm = () => {
    if (!citaIdToDelete) {
      return;
    }

    axios
      .delete(`https://backend-medical-rolling.vercel.app/api/deleteappointments/${citaIdToDelete}`)
      .then((response) => {
        // Aquí puedes realizar acciones adicionales si es necesario, como mostrar un mensaje de éxito o actualizar la lista de usuarios
      })
      .catch((error) => {
        console.error("Error al eliminar cita:", error);
        // Aquí puedes manejar el error, mostrar un mensaje de error, etc.
      })
      .finally(() => {
        // Después de enviar la solicitud, ocultar el modal de confirmación y mostrar el modal de éxito
        setShowDeleteModalAppoinment(false);
        setShowSuccessModalAppoinment(true);
        obtenerCitasDesdeBackend();
      });
  };

  // ----UPDATE USERS----

  const [userIdToUpdate, setUserIdToUpdate] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleCaptureUserIdUpdate = (usuarioId) => {
    setUserIdToUpdate(usuarioId);
  };

  const handleCaptureUserData = (userData) => {
    // Aquí guardamos los datos del usuario en el estado local o en un contexto, para luego utilizarlos al abrir la modal de edición
    setUserData(userData);
  };

  const actualizarDatosEnBackendUser = async (userIdToUpdate, formDataUser) => {
    try {
      const response = await fetch(`https://backend-medical-rolling.vercel.app/api/updateusers/${userIdToUpdate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataUser),
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos al backend");
      }
    } catch (error) {
      console.error(error.message);
    }
    obtenerUsuariosDesdeBackend();
  };

  // ----UPDATE DOCTORS----

  const [doctorIdToUpdate, setDoctorIdToUpdate] = useState(null);
  const [doctorData, setDoctorData] = useState(null);

  const handleCaptureDoctorIdUpdate = (doctorId) => {
    setDoctorIdToUpdate(doctorId);
  };

  const handleCaptureDoctorData = (doctorData) => {
    // Aquí guardamos los datos del usuario en el estado local o en un contexto, para luego utilizarlos al abrir la modal de edición
    setDoctorData(doctorData);
  };

  const actualizarDatosEnBackendDoctor = async (doctorIdToUpdate, formDataDoctor) => {
    try {
      const response = await fetch(`https://backend-medical-rolling.vercel.app/api/updatedoctors/${doctorIdToUpdate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataDoctor),
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos al backend");
      }
    } catch (error) {
      console.error(error.message);
    }
    obtenerDoctoresDesdeBackend();
  };

  // Formatear la fecha en el formato deseado antes de enviarla al servidor

  // ----UPDATE APPOINTMENTS----

  const [citaIdToUpdate, setCitaIdToUpdate] = useState(null);
  const [citaData, setCitaData] = useState(null);

  const handleCaptureCitaIdUpdate = (citaId) => {
    setCitaIdToUpdate(citaId);
  };

  const handleCaptureCitaData = (citaData) => {
    // Aquí guardamos los datos del usuario en el estado local o en un contexto, para luego utilizarlos al abrir la modal de edición
    setCitaData(citaData);
  };

  const actualizarDatosEnBackendCita = async (citaIdToUpdate, formDataCita) => {
    try {
      const response = await fetch(`https://backend-medical-rolling.vercel.app/api/updateappointments/${citaIdToUpdate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataCita),
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos al backend");
      }
    } catch (error) {
      console.error(error.message);
    }
    obtenerCitasDesdeBackend();
  };

  const [availableTimes, setAvailableTimes] = useState([]);

  const handleDateChange = async (date, doctor) => {
    try {
      const response = await axios.get("https://backend-medical-rolling.vercel.app/api/availableTimes", {
        params: {
          doctorId: doctor,
          date: moment(date).format("YYYY-MM-DD"),
        },
      });
      setAvailableTimes(response.data.availableTimes);
    } catch (error) {
      console.error("Error al obtener los horarios disponibles:", error);
    }
  };

  const generateTimeOptions = () => {
    let options = [];
    availableTimes.forEach((time) => {
      options.push(
        <option key={time} value={time}>
          {time}
        </option>
      );
    });
    return options;
  };

  // Manejador de cambio de fecha

  // ----CRUD----

  // Funciones para cambiar de tabla con botones
  const [activeTab, setActiveTab] = useState("Users");

  const [showDeleteModalUser, setShowDeleteModalUser] = useState(false); // Estado para controlar la visibilidad de la modal Users
  const [showDeleteModalDoctor, setShowDeleteModalDoctor] = useState(false); // Estado para controlar la visibilidad de la modal Doctors
  const [showDeleteModalAppoinment, setShowDeleteModalAppoinment] = useState(false); // Estado para controlar la visibilidad de la modal Doctors

  const [showSuccessModalUser, setShowSuccessModalUser] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de eliminación de Users
  const [showSuccessModalDoctor, setShowSuccessModalDoctor] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de eliminación de Doctors
  const [showSuccessModalAppoinment, setShowSuccessModalAppoinment] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de eliminación de Appointments

  const [showEditModalUser, setShowEditModalUser] = useState(false); // Estado para controlar la visibilidad de la modal Edit Users
  const [showEditModalDoctor, setShowEditModalDoctor] = useState(false); // Estado para controlar la visibilidad de la modal Edit Doctors
  const [showEditModalAppoinment, setShowEditModalAppoinment] = useState(false); // Estado para controlar la visibilidad de la modal Edit Appointments

  const [showSaveChangesModalUser, setShowSaveChangesModalUser] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de edit de Users
  const [showSaveChangesModalDoctor, setShowSaveChangesModalDoctor] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de edit de Doctors
  const [showSaveChangesModalAppoinment, setShowSaveChangesModalAppoinment] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de edit de Appointments

  const [showCreateNewModalUser, setShowCreateNewModalUser] = useState(false); // Estado para controlar la visibilidad de la modal Edit Users
  const [showCreateNewModalDoctor, setShowCreateNewModalDoctor] = useState(false); // Estado para controlar la visibilidad de la modal Edit Doctors
  const [showCreateNewModalAppoinment, setShowCreateNewModalAppoinment] = useState(false); // Estado para controlar la visibilidad de la modal Edit Appointments

  const [isOpen, setIsOpen] = useState(false); // Estado para controlar la visibilidad del dropdown

  const [showCreateNewModalUserConfirm, setShowCreateNewModalUserConfirm] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de creacion de Users
  const [showCreateNewModalDoctorConfirm, setShowCreateNewModalDoctorConfirm] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de creacion de Doctors
  const [showCreateNewModalAppoinmentConfirm, setShowCreateNewModalAppoinmentConfirm] = useState(false); // Estado para controlar la visibilidad de la modal de confirmación de creacion de Appointments

  const [showAppointmentbyIdUserModal, setShowAppointmentbyIdUserModal] = useState(false); // Estado para controlar la visibilidad de la modal de citas del User
  const [showAppointmentbyIdDoctorModal, setShowAppointmentbyIdDoctorModal] = useState(false); // Estado para controlar la visibilidad de la modal de citas del Doctor

  const checkDniUserAvailability = async (dni) => {
    try {
      const response = await axios.get(`https://backend-medical-rolling.vercel.app/api/checkDniUser/${dni}`);
      return response.data.message === "The DNI is available";
    } catch (error) {
      console.error("Error checking DNI availability:", error);
      return false;
    }
  };

  const checkEmailUserAvailability = async (email) => {
    try {
      const response = await axios.get(`https://backend-medical-rolling.vercel.app/api/checkEmailUser/${email}`);
      return response.data.message === "The email is available";
    } catch (error) {
      console.error("Error checking Email availability:", error);
      return false;
    }
  };

  const checkDniDoctorAvailability = async (dni) => {
    try {
      const response = await axios.get(`https://backend-medical-rolling.vercel.app/api/checkDniDoctor/${dni}`);
      return response.data.message === "The DNI is available";
    } catch (error) {
      console.error("Error checking DNI availability:", error);
      return false;
    }
  };

  const checkEmailDoctorAvailability = async (email) => {
    try {
      const response = await axios.get(`https://backend-medical-rolling.vercel.app/api/checkEmailDoctor/${email}`);
      return response.data.message === "The email is available";
    } catch (error) {
      console.error("Error checking Email availability:", error);
      return false;
    }
  };

  // Esquema de validación de Yup con validación personalizada para el campo 'dni'
  const createUserValidationSchema = Yup.object().shape({
    dni: Yup.number()
      .required("El DNI es requerido")
      .test("checkDniAvailability", "El DNI ya está en uso", async function (value) {
        if (!value) return true; // Si no hay valor, se omite la validación
        return await checkDniUserAvailability(value);
      }),
    name: Yup.string().required("El nombre es requerido").min(3, "El nombre debe tener al menos 3 caracteres").max(50, "El nombre no debe exceder los 50 caracteres"),
    lastname: Yup.string().required("El apellido es requerido").min(3, "El apellido debe tener al menos 3 caracteres").max(50, "El apellido no debe exceder los 50 caracteres"),
    email: Yup.string()
      .email("Formato de correo electrónico inválido")
      .required("El correo electrónico es requerido")
      .test("checkEmailAvailability", "El email ya está en uso", async function (value) {
        if (!value) return true; // Si no hay valor, se omite la validación
        return await checkEmailUserAvailability(value);
      }),
    pass: Yup.string().required("La contraseña es requerida").min(8, "La contraseña debe tener al menos 8 caracteres").max(80, "La contraseña no debe exceder los 80 caracteres"),
    province: Yup.string().required("La provincia es requerida"),
    address: Yup.string().required("La dirección es requerida"),
    area: Yup.number().required("El área es requerida"),
    phone: Yup.number()
      .required("El teléfono es requerido")
      .test("len", "El teléfono debe tener 9 dígitos", (val) => val && val.toString().length === 9),
  });

  const createDoctorValidationSchema = Yup.object().shape({
    dni: Yup.number()
      .required("El DNI es requerido")
      .test("checkDniAvailability", "El DNI ya está en uso", async function (value) {
        if (!value) return true; // Si no hay valor, se omite la validación
        return await checkDniDoctorAvailability(value);
      }),
    name: Yup.string().required("El nombre es requerido").min(3, "El nombre debe tener al menos 3 caracteres").max(50, "El nombre no debe exceder los 50 caracteres"),
    lastname: Yup.string().required("El apellido es requerido").min(3, "El apellido debe tener al menos 3 caracteres").max(50, "El apellido no debe exceder los 50 caracteres"),
    email: Yup.string()
      .email("Formato de correo electrónico inválido")
      .required("El correo electrónico es requerido")
      .test("checkEmailAvailability", "El email ya está en uso", async function (value) {
        if (!value) return true; // Si no hay valor, se omite la validación
        return await checkEmailDoctorAvailability(value);
      }),
    pass: Yup.string().required("La contraseña es requerida").min(8, "La contraseña debe tener al menos 8 caracteres").max(80, "La contraseña no debe exceder los 80 caracteres"),
    specialty: Yup.string().required("La especialidad es requerida"),
    licenceNumber: Yup.number().required("El número de licencia es requerido"),
    rol: Yup.string().required("El rol es requerido"),
  });

  const appointmentCreateValidationSchema = Yup.object().shape({
    // user: Yup.string().required("El usuario es requerido"),
    // doctor: Yup.string().required("El doctor es requerido"),
    appointmentDate: Yup.string().required("La fecha es requerida"),
    appointmentTime: Yup.string().required("La hora es requerida"),
    // state: Yup.string().required("El estado es requerido"),
  });

  const userValidationSchema = Yup.object().shape({
    email: Yup.string().email("Correo electrónico inválido").required("El correo electrónico es requerido"),
    telefono: Yup.number().required("El DNI es requerido"),
    DNI: Yup.number().required("El DNI es requerido"),
    nombre: Yup.string().required("El nombre es requerido"),
    apellido: Yup.string().required("El apellido es requerido"),
    provincia: Yup.string().required("La provincia es requerida"),
    direccion: Yup.string().required("La dirección es requerida"),
    area: Yup.number().required("El área es requerida"),
    rol: Yup.string().required("El rol es requerido"),
  });

  const doctorValidationSchema = Yup.object().shape({
    email: Yup.string().email("Correo electrónico inválido").required("El correo electrónico es requerido"),
    DNI: Yup.number().required("El DNI es requerido"),
    nombre: Yup.string().required("El nombre es requerido"),
    apellido: Yup.string().required("El apellido es requerido"),
    rol: Yup.string().required("El rol es requerido"),
    especialidad: Yup.string().required("La especialidad es requerida"),
    numLicencia: Yup.number().required("El número de licencia es requerido"),
  });

  const appointmentValidationSchema = Yup.object().shape({
    // usuario: Yup.string().required("El usuario es requerido"),
    // doctor: Yup.string().required("El doctor es requerido"),
    fecha: Yup.string().required("La fecha es requerida"),
    hora: Yup.string().required("La hora es requerida"),
    estado: Yup.string().required("El estado es requerido"),
  });

  //Funciones para manejar los filtros busqueda y de ordenamiento
  const handleBusquedaChange = (e) => {
    const searchTerm = e.target.value;
    setBusqueda(searchTerm);
  };

  // Funciones para manejar la visibilidad de la modal de appoinments by id user
  const openAppointmentByIdUserModal = () => {
    setShowAppointmentbyIdUserModal(true); // Abre la modal
  };

  const closeAppointmentByIdUserModal = () => {
    setShowAppointmentbyIdUserModal(false); // Cierra la modal
  };

  // Funciones para manejar la visibilidad de la modal de appoinments by id doctor
  const openAppointmentByIdDoctorModal = () => {
    setShowAppointmentbyIdDoctorModal(true); // Abre la modal
  };

  const closeAppointmentByIdDoctorModal = () => {
    setShowAppointmentbyIdDoctorModal(false); // Cierra la modal
  };

  // Funciones para confirmar creacion de un Appointment
  const handleCreateNewAppoinmentConfirm = () => {
    setShowCreateNewModalAppoinmentConfirm(true);
  };

  const handleCerrarCreateNewAppoinmentSuccess = () => {
    setShowCreateNewModalAppoinmentConfirm(false);
  };
  // Funciones para confirmar creacion de un Doctor
  const handleCreateNewDoctorConfirm = () => {
    setShowCreateNewModalDoctorConfirm(true);
  };

  const handleCerrarCreateNewDoctorSuccess = () => {
    setShowCreateNewModalDoctorConfirm(false);
  };
  // Funciones para confirmar creacion de un User
  const handleCreateNewUserConfirm = () => {
    setShowCreateNewModalUserConfirm(true);
  };

  const handleCerrarCreateNewUserSuccess = () => {
    setShowCreateNewModalUserConfirm(false);
  };

  // Funciones para abrir y cerrar la modal Create New Appointment
  const closeDropdownAndOpenCreateNewModalAppointment = () => {
    openCreateNewModalAppointment();
    closeDropdown();
  };

  // Funciones para abrir y cerrar la modal Create New Doctor
  const closeDropdownAndOpenCreateNewModalDoctor = () => {
    openCreateNewModalDoctor();
    closeDropdown();
  };

  // Funciones para abrir y cerrar la modal Create New User
  const closeDropdownAndOpenCreateNewModalUser = () => {
    openCreateNewModalUser();
    closeDropdown();
  };
  // Funciones para abrir y cerrar la modal Create New Users
  const openCreateNewModalUser = () => {
    setShowCreateNewModalUser(true);
  };

  const closeCreateNewModalUser = () => {
    setShowCreateNewModalUser(false);
  };

  // Funciones para abrir y cerrar la modal Create New Doctors
  const openCreateNewModalDoctor = () => {
    setShowCreateNewModalDoctor(true);
  };

  const closeCreateNewModalDoctor = () => {
    setShowCreateNewModalDoctor(false);
  };

  // Funciones para abrir y cerrar la modal Create New Appointments
  const openCreateNewModalAppointment = () => {
    setShowCreateNewModalAppoinment(true);
  };

  const closeCreateNewModalAppointment = () => {
    setShowCreateNewModalAppoinment(false);
  };

  // Funciones para confirmar los cambios guardados de un Appointment
  const handleSaveChangesAppoinmentConfirm = () => {
    setShowSaveChangesModalAppoinment(true);
  };

  const handleCerrarSaveChangesAppoinmentSuccess = () => {
    setShowSaveChangesModalAppoinment(false);
  };
  // Funciones para confirmar los cambios guardados de un Doctor
  const handleSaveChangesDoctorConfirm = () => {
    setShowSaveChangesModalDoctor(true);
  };

  const handleCerrarSaveChangesDoctorSuccess = () => {
    setShowSaveChangesModalDoctor(false);
  };
  // Funciones para confirmar los cambios guardados de un User
  const handleSaveChangesUserConfirm = () => {
    setShowSaveChangesModalUser(true);
  };

  const handleCerrarSaveChangesUserSuccess = () => {
    setShowSaveChangesModalUser(false);
  };

  const handleCerrarDeleteAppoinmentSucess = () => {
    // Aquí puedes manejar la cancelación de la eliminación del usuario
    setShowSuccessModalAppoinment(false);
  };

  const handleCerrarDeleteDoctorSucess = () => {
    // Aquí puedes manejar la cancelación de la eliminación del doctor
    setShowSuccessModalDoctor(false);
  };

  const handleCerrarDeleteUserSucess = () => {
    // Aquí puedes manejar la cancelación de la eliminación del usuario
    setShowSuccessModalUser(false);
  };

  // Funciones para abrir y cerrar la modal EditUsers
  const openEditModalUser = () => {
    setShowEditModalUser(true);
  };

  const closeEditModalUser = () => {
    setShowEditModalUser(false);
  };

  // Funciones para abrir y cerrar la modal EditDoctors
  const openEditModalDoctor = () => {
    setShowEditModalDoctor(true);
  };

  const closeEditModalDoctor = () => {
    setShowEditModalDoctor(false);
  };

  // Funciones para abrir y cerrar la modal EditAppointments
  const openEditModalAppointment = () => {
    setShowEditModalAppoinment(true);
  };

  const closeEditModalAppointment = () => {
    setShowEditModalAppoinment(false);
  };

  // Funciones para abrir y cerrar la modal DeleteUsers
  const openDeleteModalUser = () => {
    setShowDeleteModalUser(true);
  };

  const closeDeleteModalUser = () => {
    setShowDeleteModalUser(false);
  };

  // Funciones para abrir y cerrar la modal DeleteDoctors
  const openDeleteModalDoctor = () => {
    setShowDeleteModalDoctor(true);
  };

  const closeDeleteModalDoctor = () => {
    setShowDeleteModalDoctor(false);
  };

  // Funciones para abrir y cerrar la modal DeleteAppointments
  const openDeleteModalAppointment = () => {
    setShowDeleteModalAppoinment(true);
  };

  const closeDeleteModalAppointment = () => {
    setShowDeleteModalAppoinment(false);
  };

  // Funciones cambiar entre las tablas
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Cierrar boton Create New
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // export tablas

  const [csvData, setCsvData] = useState([]);

  const handleExportCSV = () => {
    const dataToExport = getTableData();
    const csvData = [
      Object.keys(dataToExport[0]), // Encabezados
      ...dataToExport.map((item) => Object.values(item)),
    ];

    // Convertir los datos CSV a texto CSV
    const csvText = csvData.map((row) => row.join(",")).join("\n");

    // Crear un Blob que contiene el texto CSV
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });

    // Utilizar file-saver para descargar el archivo CSV
    saveAs(blob, "datos.csv");

    // Actualizar el estado de csvData si es necesario
    setCsvData(csvData);
  };
  // Función para obtener los datos de la tabla actual
  const getTableData = () => {
    switch (activeTab) {
      case "Users":
        return filteredUsuarios.map((usuario) => ({
          ID: usuario._id,
          DNI: usuario.dni,
          NombreCompleto: `${usuario.name} ${usuario.lastname}`,
          Email: usuario.email,
          Provincia: usuario.province,
          Area: usuario.area,
          Telefono: usuario.phone,
          Address: usuario.address,
          Rol: usuario.isDoctor === false && usuario.isAuditor === false ? "User" : "",
        }));
      case "Doctors":
        return filteredDoctors.map((doctor) => ({
          ID: doctor._id,
          DNI: doctor.dni,
          NombreCompleto: `${doctor.name} ${doctor.lastname}`,
          Email: doctor.email,
          Especialidad: doctor.specialty,
          Licencia: doctor.licenceNumber,
          Rol: doctor.isDoctor === true && doctor.isAuditor === true ? "Auditor" : "Doctor",
        }));
      case "Appointments":
        return filteredCitas.map((cita) => ({
          ID: cita._id,
          User: cita.user,
          NombreUsuario: nombresApellidosUsuarios[cita.user],
          Doctor: cita.doctor,
          NombreDoctor: nombresApellidosDoctores[cita.doctor],
          Fecha: cita.appointmentDate,
          Hora: cita.appointmentTime,
          Estado: typeof cita.state === "string" ? cita.state.toLowerCase() : cita.state ? "Activa" : "Inactiva",
        }));
      default:
        return [];
    }
  };

  // export tablas

  return (
    <div className="bg-w">
      {/* component */}
      <section className="container mx-auto max-w-full p-6 font-sans">
        {/* ---Boton Export y Create New--- */}
        <div className="sm:flex sm:items-center sm:justify-between ">
          <div>
            {/* ---Botones Users, Doctors y Appoinments--- */}
            <div className="inline-flex overflow-hidden bg-hb text-w border divide-x rounded-lg rtl:flex-row-reverse  border-c  divide-c">
              <button
                className={`px-5 py-2 text-xs font-medium transition-colors duration-200 sm:text-sm hover:bg-ts hover:text-c ${activeTab === "Users" ? "bg-ts text-c" : ""}`}
                onClick={() => handleTabClick("Users")}>
                Users
              </button>
              <button
                className={`px-5 py-2 text-xs font-medium transition-colors duration-200 sm:text-sm hover:bg-ts hover:text-c ${activeTab === "Doctors" ? "bg-ts text-c" : ""}`}
                onClick={() => handleTabClick("Doctors")}>
                Doctors
              </button>
              <button
                className={`px-5 py-2 text-xs font-medium transition-colors duration-200 sm:text-sm hover:bg-ts hover:text-c ${activeTab === "Appointments" ? "bg-ts text-c" : ""}`}
                onClick={() => handleTabClick("Appointments")}>
                Appointments
              </button>
            </div>
          </div>
          {/* ---Botones Users, Doctors y Appoinments--- */}
          {/* ---Boton Export y Create New--- */}
          <div className="flex items-center mt-4 gap-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex justify-center items-center w-1/2 px-5 py-2 text-sm transition-colors duration-200 bg-hb border rounded-lg gap-x-2 sm:w-auto hover:bg-ts text-w hover:text-c border-c">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="font-medium">Exportar</span>
            </button>

            <div className="dropdown items-center">
              <div tabIndex={0} role="button" onClick={toggleDropdown}>
                <summary className="m-2 btn inline-flex justify-center items-center w-full sm:w-auto px-3 py-3 text-sm transition-colors duration-200 bg-ts border rounded-lg gap-x-2 sm:inline-block hover:bg-ts text-c border-c">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 hidden sm:inline-block">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Create New
                </summary>
              </div>
              <ul tabIndex={0} className={`bg-c text-w dropdown-content z-[1] menu p-2 shadow font-sans font-medium rounded-box w-full sm:w-40 items-center ${isOpen ? "block" : "hidden"}`}>
                <li className="content-center">
                  <button onClick={closeDropdownAndOpenCreateNewModalUser}>User</button>
                </li>
                <li className="content-center">
                  <button onClick={closeDropdownAndOpenCreateNewModalDoctor}>Doctor</button>
                </li>
                <li className="content-center">
                  <button onClick={closeDropdownAndOpenCreateNewModalAppointment}>Appointment</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* ---Boton Export y Create New--- */}
        {/* ---Input Search--- */}
        <div className="mt-6 md:flex md:items-center md:justify-between">
          <div className="relative flex items-center mt-4 md:mt-0">
            <span className="absolute">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mx-3 text-c">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              value={busqueda}
              type="text"
              placeholder="Search"
              onChange={handleBusquedaChange}
              className="block w-full py-1.5 pr-5 text-c bg-w border border-c rounded-lg md:w-80 placeholder-c pl-11 rtl:pr-11 rtl:pl-5 focus:border-ts  focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          {/* ---Input Search--- */}
          {/* ---Span Mostrando resultados--- */}
          {/* <div className="flex items-center gap-x-3">
            <span className="px-3 py-1 text-xs text-hb bg-w rounded-full">Mostrando 1-10 de 1000 resultados</span>
          </div> */}
        </div>
        {/* ---Span Mostrando resultados--- */}
        <div className="flex flex-col mt-6  max-w-full">
          <div className="-mx-4 -my-2 overflow-x-auto xl:-mx-6 lg:-mx-8 ">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8 ">
              <div className="overflow-hidden border border-c md:rounded-lg">
                {/* ---TABLAUSERS--- */}
                {activeTab === "Users" && (
                  <table className="min-w-full divide-y divide-c text-center">
                    {/* ---THEAD--- */}
                    <thead className="bg-c text-center">
                      <tr>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">ID</span>
                          </div>
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">DNI/LC/LE</span>
                          </div>
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Nombre Completo</span>
                          </div>
                        </th>
                        <th scope="col" className="px-12 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Email</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Provincia</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Area</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Telefono</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Address</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Rol</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w">
                          Citas
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    {/* ---THEAD--- */}
                    {/* ---TBODY--- */}
                    <tbody className="bg-white divide-y divide-c">
                      {/* Renderizar las filas filtradas */}
                      {filteredUsuarios.map((usuario) => (
                        <tr key={usuario._id}>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario._id}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario.dni}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{`${usuario.name} ${usuario.lastname}`}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario.email}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario.province}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario.area}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario.phone}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario.address}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{usuario.isDoctor === false && usuario.isAuditor === false ? "User" : ""}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">
                            <button
                              onClick={() => {
                                openAppointmentByIdUserModal(usuario._id);
                                fetchAppointmentsByUser(usuario._id);
                              }}
                              className="px-2 py-1 text-w bg-hb hover:bg-ts hover:text-c  rounded-lg">
                              Ver citas
                            </button>
                          </td>
                          <td>
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => {
                                  handleCaptureUserIdUpdate(usuario._id);
                                  handleCaptureUserData(usuario);
                                  openEditModalUser();
                                }}
                                className="hover:bg-w  rounded focus:outline-none focus:shadow-outline">
                                <img src={lapiz} alt="Editar" className="h-6 w-6" />
                              </button>
                              <button
                                onClick={() => {
                                  handleCaptureUserId(usuario._id);
                                  openDeleteModalUser();
                                }}
                                className="hover:bg-w   rounded focus:outline-none focus:shadow-outline">
                                <img src={eliminar} alt="Eliminar" className="h-6 w-6" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* ---TBODY--- */}
                  </table>
                )}
                {/* ---TABLAUSERS--- */}
                {/* ---TABLADOCTORS--- */}
                {activeTab === "Doctors" && (
                  <table className="min-w-full divide-y divide-c text-center">
                    {/* ---THEAD--- */}
                    <thead className="bg-c text-center">
                      <tr>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">ID</span>
                          </div>
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">DNI/LC/LE</span>
                          </div>
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Nombre Completo</span>
                          </div>
                        </th>
                        <th scope="col" className="px-12 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Email</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Especialidad</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Licencia</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Rol</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w">
                          Citas
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    {/* ---THEAD--- */}
                    {/* ---TBODY--- */}
                    <tbody className="bg-white divide-y divide-c">
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{doctor._id}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{doctor.dni}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{`${doctor.name} ${doctor.lastname}`}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{doctor.email}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{doctor.specialty}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{doctor.licenceNumber}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{doctor.isDoctor === true && doctor.isAuditor === true ? "Auditor" : "Doctor"}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">
                            <button
                              onClick={() => {
                                openAppointmentByIdDoctorModal(doctor._id);
                                fetchAppointmentsByDoctor(doctor._id);
                              }}
                              className="px-2 py-1 text-w bg-hb hover:bg-ts hover:text-c  rounded-lg">
                              Ver citas
                            </button>
                          </td>
                          <td>
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => {
                                  handleCaptureDoctorIdUpdate(doctor._id);
                                  handleCaptureDoctorData(doctor);
                                  openEditModalDoctor();
                                }}
                                className="hover:bg-w rounded focus:outline-none focus:shadow-outline">
                                <img src={lapiz} alt="Editar" className="h-6 w-6" />
                              </button>
                              <button
                                onClick={() => {
                                  handleCaptureDoctorId(doctor._id);
                                  openDeleteModalDoctor();
                                }}
                                className="hover:bg-w  rounded focus:outline-none focus:shadow-outline">
                                <img src={eliminar} alt="Eliminar" className="h-6 w-6" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* ---TBODY--- */}
                  </table>
                )}
                {/* ---TABLADOCTORS--- */}
                {/* ---TABLAAPPOINTMENTS--- */}
                {activeTab === "Appointments" && (
                  <table className="min-w-full divide-y divide-c text-center">
                    {/* ---THEAD--- */}
                    <thead className="bg-c text-center">
                      <tr>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">ID</span>
                          </div>
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">User</span>
                          </div>
                        </th>
                        <th scope="col" className="px-12 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Nombre Usuario</span>
                          </div>
                        </th>
                        <th scope="col" className="px-12 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Doctor</span>
                          </div>
                        </th>
                        <th scope="col" className="px-12 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Nombre Doctor</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Fecha</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Hora</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w relative">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">Estado</span>
                          </div>
                        </th>
                        <th scope="col" className="px-4 py-3.5 text-sm font-medium text-center text-w">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    {/* ---THEAD--- */}
                    {/* ---TBODY--- */}
                    <tbody className="bg-white divide-y divide-c">
                      {filteredCitas.map((cita) => (
                        <tr key={cita._id}>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{cita._id}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{cita.user}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{nombresApellidosUsuarios[cita.user]}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{cita.doctor}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{nombresApellidosDoctores[cita.doctor]}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">
                            {cita.appointmentDate} {/* Fecha */}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{cita.appointmentTime}</td>
                          <td className="px-4 py-4 text-sm font-medium text-c whitespace-nowrap">{typeof cita.state === "string" ? cita.state.toLowerCase() : cita.state ? "Activa" : "Inactiva"}</td>
                          <td>
                            <div className="flex justify-center gap-4">
                              <button
                                onClick={() => {
                                  handleCaptureCitaIdUpdate(cita._id);
                                  handleCaptureCitaData(cita);
                                  openEditModalAppointment();
                                  // Aquí llamamos a handleDateChange con los valores relevantes
                                  handleDateChange(cita.appointmentDate, cita.doctor);
                                }}
                                className="hover:bg-w rounded focus:outline-none focus:shadow-outline">
                                <img src={lapiz} alt="Editar" className="h-6 w-6" />
                              </button>
                              <button
                                onClick={() => {
                                  handleCaptureCitaId(cita._id);
                                  openDeleteModalAppointment();
                                }}
                                className="hover:bg-w  rounded focus:outline-none focus:shadow-outline">
                                <img src={eliminar} alt="Eliminar" className="h-6 w-6" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* ---TBODY--- */}
                  </table>
                )}
                {/* ---TABLAAPPOINTMENTS--- */}
              </div>
            </div>
          </div>
        </div>
        {/* Modal de confirmación para eliminar Users */}
        {showDeleteModalUser && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeDeleteModalUser}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="font-medium text-c">¿Estás seguro de que quieres eliminar este Usuario?</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handleDeleteUserConfirm(userIdToDelete)}
                  className="px-4 py-2 btn-info bg-ts hover:bg-hb hover:text-w hover:border-none text-c rounded mr-4"
                  // Llamar a la función para eliminar el elemento al confirmar
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={closeDeleteModalUser}
                  className="btn-info bg-ts hover:bg-hb hover:text-w hover:border-none text-c px-4 py-2 rounded"
                  // Llamar a la función para cerrar la modal al cancelar
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación para eliminar Doctors */}
        {showDeleteModalDoctor && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeDeleteModalDoctor}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="font-medium text-c">¿Estás seguro de que quieres eliminar este Doctor?</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDeleteDoctorConfirm}
                  className="px-4 py-2 btn-info bg-ts hover:bg-hb hover:text-w hover:border-none text-c rounded mr-4"
                  // Llamar a la función para eliminar el elemento al confirmar
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={closeDeleteModalDoctor}
                  className="btn-info bg-ts hover:bg-hb hover:text-w hover:border-none text-c px-4 py-2 rounded"
                  // Llamar a la función para cerrar la modal al cancelar
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación para eliminar Appointments */}
        {showDeleteModalAppoinment && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeDeleteModalAppointment}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="font-medium text-c">¿Estás seguro de que quieres eliminar este Appointment?</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDeleteCitaConfirm}
                  className="px-4 py-2 btn-info bg-ts hover:bg-hb hover:text-w hover:border-none text-c rounded mr-4"
                  // Llamar a la función para eliminar el elemento al confirmar
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={closeDeleteModalAppointment}
                  className="btn-info bg-ts hover:bg-hb hover:text-w hover:border-none text-c px-4 py-2 rounded"
                  // Llamar a la función para cerrar la modal al cancelar
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal para editar Users */}
        {showEditModalUser && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeEditModalUser}>
            <div className="bg-c text-w rounded-lg p-8 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
              <h1 className="text-3xl font-bold mb-6">Editar Usuario</h1>
              <Formik
                initialValues={{
                  DNI: userData.dni || "",
                  nombre: userData.name || "",
                  apellido: userData.lastname || "",
                  email: userData.email || "",
                  provincia: userData.province || "",
                  direccion: userData.address || "",
                  area: userData.area || "",
                  telefono: userData.phone || "",
                  rol: userData.isDoctor === false && userData.isAuditor === false ? "User" : "",
                }}
                validationSchema={userValidationSchema}
                onSubmit={(values) => {
                  // Define initial values for isDoctor and isAuditor
                  let isDoctorValue = false;
                  let isAuditorValue = false;

                  // Check the value of the role and update isDoctor and isAuditor accordingly
                  if (values.rol === "User") {
                    isDoctorValue = false;
                    isAuditorValue = false;
                  } else if (values.rol === "Doctor") {
                    isDoctorValue = true;
                    isAuditorValue = false;
                  } else if (values.rol === "Auditor") {
                    isDoctorValue = true;
                    isAuditorValue = true;
                  }

                  // Create an object with the form values including isDoctor and isAuditor
                  const formDataUser = {
                    dni: values.DNI,
                    name: values.nombre,
                    lastname: values.apellido,
                    email: values.email,
                    province: values.provincia,
                    address: values.direccion,
                    area: values.area,
                    phone: values.telefono,
                    role: values.rol,
                    isDoctor: isDoctorValue,
                    isAuditor: isAuditorValue,
                  };
                  actualizarDatosEnBackendUser(userIdToUpdate, formDataUser);
                  handleSaveChangesUserConfirm();
                  closeEditModalUser();
                }}>
                {({ handleSubmit }) => (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="DNI" className="mr-2 w-24">
                        DNI:
                      </label>
                      <Field type="number" className="input-field bg-w text-c rounded w-44" name="DNI" placeholder="DNI/LC/LE/PASSPORT" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="nombre" className="mr-2 w-24">
                        Nombre:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="nombre" placeholder="Nombre" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="apellido" className="mr-2 w-24">
                        Apellido:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="apellido" placeholder="Apellido" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="email" className="mr-2 w-24">
                        Email:
                      </label>
                      <Field type="email" className="input-field bg-w text-c rounded w-44" name="email" placeholder="Correo electrónico" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="provincia" className="mr-2 w-24">
                        Provincia:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="provincia" placeholder="Provincia" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="direccion" className="mr-2 w-24">
                        Dirección:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="direccion" placeholder="Dirección" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="area" className="mr-2 w-24">
                        Área:
                      </label>
                      <Field type="number" className="input-field bg-w text-c rounded w-44" name="area" placeholder="Área" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="telefono" className="mr-2 w-24">
                        Teléfono:
                      </label>
                      <Field type="number" className="input-field bg-w text-c rounded w-44" name="telefono" placeholder="Teléfono" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="rol" className="mr-2 w-24">
                        Rol:
                      </label>
                      <Field as="select" className="input-field bg-w text-c rounded w-44" name="rol">
                        <option value="">Selecciona un rol</option>
                        <option value="User">User</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Auditor">Auditor</option>
                      </Field>
                    </div>
                    <div className="flex justify-between">
                      <button onClick={handleSaveChangesUserConfirm} type="submit" className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Guardar Cambios
                      </button>
                      <button onClick={closeEditModalUser} className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        )}

        {/* Modal para editar Doctors */}
        {showEditModalDoctor && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeEditModalDoctor}>
            <div className="bg-c text-w rounded-lg p-8 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
              <h1 className="text-3xl font-bold mb-6">Editar Doctor</h1>
              <Formik
                initialValues={{
                  DNI: doctorData.dni || "",
                  nombre: doctorData.name || "",
                  apellido: doctorData.lastname || "",
                  email: doctorData.email || "",
                  especialidad: doctorData.specialty || "",
                  numLicencia: doctorData.licenceNumber || "",
                  rol: doctorData.isDoctor === true && doctorData.isAuditor === false ? "Doctor" : "Auditor",
                }}
                validationSchema={doctorValidationSchema}
                onSubmit={(values) => {
                  // Define initial values for isDoctor and isAuditor
                  let isDoctorValue = false;
                  let isAuditorValue = false;

                  // Check the value of the role and update isDoctor and isAuditor accordingly
                  if (values.rol === "User") {
                    isDoctorValue = false;
                    isAuditorValue = false;
                  } else if (values.rol === "Doctor") {
                    isDoctorValue = true;
                    isAuditorValue = false;
                  } else if (values.rol === "Auditor") {
                    isDoctorValue = true;
                    isAuditorValue = true;
                  }

                  // Create an object with the form values including isDoctor and isAuditor
                  const formDataDoctor = {
                    dni: values.DNI,
                    name: values.nombre,
                    lastname: values.apellido,
                    email: values.email,
                    specialty: values.especialidad,
                    licenceNumber: values.numLicencia,
                    role: values.rol,
                    isDoctor: isDoctorValue,
                    isAuditor: isAuditorValue,
                  };
                  actualizarDatosEnBackendDoctor(doctorIdToUpdate, formDataDoctor);
                  handleSaveChangesDoctorConfirm();
                  closeEditModalDoctor();
                }}>
                {({ handleSubmit }) => (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="DNI" className="mr-2 w-24">
                        DNI:
                      </label>
                      <Field type="number" className="input-field bg-w text-c rounded w-44" name="DNI" placeholder="DNI/LC/LE/PASSPORT" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="nombre" className="mr-2 w-24">
                        Nombre:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="nombre" placeholder="Nombre" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="apellido" className="mr-2 w-24">
                        Apellido:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="apellido" placeholder="Apellido" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="email" className="mr-2 w-24">
                        Email:
                      </label>
                      <Field type="email" className="input-field bg-w text-c rounded w-44" name="email" placeholder="Correo electrónico" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="especialidad" className="mr-2 w-24">
                        Especialidad:
                      </label>
                      <Field as="select" className="input-field bg-w text-c rounded w-44" name="especialidad">
                        <option value="">Selecciona una especialidad</option>
                        {especialidadesMedicas.map((especialidad, index) => (
                          <option key={index} value={especialidad}>
                            {especialidad}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="numLicencia" className="mr-2 w-24">
                        Licencia:
                      </label>
                      <Field type="number" className="input-field bg-w text-c rounded w-44" name="numLicencia" placeholder="Número de Licencia" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="rol" className="mr-2 w-24">
                        Rol:
                      </label>
                      <Field as="select" className="input-field bg-w text-c rounded w-44" name="rol">
                        <option value="">Selecciona un rol</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Auditor">Auditor</option>
                      </Field>
                    </div>
                    <div className="flex justify-between">
                      <button onClick={handleSaveChangesDoctorConfirm} type="submit" className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Guardar Cambios
                      </button>
                      <button onClick={closeEditModalDoctor} className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        )}

        {/* Modal para editar Appointments */}
        {showEditModalAppoinment && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeEditModalAppointment}>
            <div className="bg-c text-w rounded-lg p-8 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
              <h1 className="text-3xl font-bold mb-6">Editar Cita</h1>
              <Formik
                initialValues={{
                  usuario: citaData.user || "",
                  Doctor: citaData.doctor || "",
                  fecha: moment(citaData.appointmentDate, "YYYY-MM-DD").toDate() || "",
                  hora: citaData.appointmentTime || "",
                  estado: citaData.state === true ? "Activa" : "Inactiva",
                }}
                validationSchema={appointmentValidationSchema}
                onSubmit={(values) => {
                  // Define initial values for isDoctor and isAuditor
                  let stateValue = false;

                  // Check the value of the state and update stateValue accordingly
                  if (values.estado === "Activa") {
                    stateValue = true;
                  } else if (values.estado === "Inactiva") {
                    stateValue = false;
                  }

                  stateValue = Boolean(stateValue); // Convertir a booleano

                  const selectedDate = moment(values.fecha); // Obtener la fecha seleccionada del formulario

                  // Obtener la fecha formateada para enviarla al backend
                  const formattedDate = selectedDate.format("YYYY-MM-DD");

                  // Create an object with the form values including isDoctor and isAuditor
                  const formDataCita = {
                    user: values.usuario,
                    doctor: values.Doctor,
                    appointmentDate: formattedDate,
                    appointmentTime: values.hora,
                    state: stateValue,
                  };

                  // Aquí puedes manejar la lógica para enviar los datos del formulario
                  actualizarDatosEnBackendCita(citaIdToUpdate, formDataCita);
                  closeEditModalAppointment();
                  handleSaveChangesAppoinmentConfirm();
                }}>
                {(
                  { handleSubmit, values, setFieldValue } // Asegúrate de incluir values aquí
                ) => (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="usuario" className="mr-2 w-24">
                        User ID:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="usuario" placeholder="Usuario" readOnly />
                      <ErrorMessage name="usuario" component="div" className="text-red-300" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="nombreUsuario" className="mr-2 w-24">
                        Nombre Usuario:
                      </label>
                      {nombresApellidosUsuarios[values.usuario]}
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="Doctor" className="mr-2 w-24">
                        Doctor ID:
                      </label>
                      <Field type="text" className="input-field bg-w text-c rounded w-44" name="Doctor" placeholder="Doctor" readOnly />
                      <ErrorMessage name="Doctor" component="div" className="text-red-300" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="nombreDoctor" className="mr-2 w-24">
                        Nombre Doctor:
                      </label>
                      {nombresApellidosDoctores[values.Doctor]}
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="fecha" className="mr-2 w-24">
                        Fecha:
                      </label>
                      <DatePicker
                        className="input-field bg-w text-c rounded w-44"
                        selected={values.fecha}
                        onChange={(date) => {
                          setFieldValue("fecha", date);
                          handleDateChange(date, values.Doctor);
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Selecciona una fecha"
                        name="fecha"
                        filterDate={(date) => {
                          // Restringe la selección a días posteriores a hoy y que no sean sábado ni domingo
                          const day = date.getDay();
                          const today = new Date();
                          return day !== 0 && day !== 6 && date >= today;
                        }}
                      />
                      <ErrorMessage name="fecha" component="div" className="text-red-300" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="hora" className="mr-2 w-24">
                        Hora:
                      </label>
                      <Field as="select" className="input-field bg-w text-c rounded w-44" name="hora">
                        <option value="">Selecciona una hora</option>
                        {generateTimeOptions()}
                      </Field>
                      <ErrorMessage name="hora" component="div" className="text-red-300" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="estado" className="mr-2 w-24">
                        Estado:
                      </label>
                      <Field as="select" className="input-field bg-w text-c rounded w-44" name="estado">
                        <option value="Activa">Activa</option>
                        <option value="Inactiva">Inactiva</option>
                      </Field>
                      <ErrorMessage name="estado" component="div" className="text-red-300" />
                    </div>
                    <div className="flex justify-between">
                      <button onClick={handleSaveChangesAppoinmentConfirm} type="submit" className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Guardar Cambios
                      </button>
                      <button onClick={closeEditModalAppointment} className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminar User */}
        {showSuccessModalUser && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarDeleteUserSucess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Usuario eliminado correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCerrarDeleteUserSucess}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación de eliminar Doctor */}
        {showSuccessModalDoctor && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarDeleteDoctorSucess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Doctor eliminado correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCerrarDeleteDoctorSucess}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación de eliminar Doctor */}
        {showSuccessModalAppoinment && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarDeleteAppoinmentSucess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Doctor eliminado correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCerrarDeleteAppoinmentSucess}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación de guardar cambios de User */}
        {showSaveChangesModalUser && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarSaveChangesUserSuccess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Cambios guardados correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    handleCerrarSaveChangesUserSuccess();
                    closeEditModalUser();
                  }}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {showSaveChangesModalDoctor && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarSaveChangesDoctorSuccess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Cambios guardados correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    handleCerrarSaveChangesDoctorSuccess();
                    closeEditModalDoctor();
                  }}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación de guardar cambios de User */}
        {showSaveChangesModalAppoinment && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarSaveChangesAppoinmentSuccess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Cambios guardados correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    handleCerrarSaveChangesAppoinmentSuccess();
                    closeEditModalAppointment();
                  }}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal para Crear Nuevos Users */}
        {showCreateNewModalUser && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeCreateNewModalUser}>
            <div className="bg-c text-w rounded-lg p-8 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
              <h1 className="text-3xl font-bold mb-6">Crear Usuario</h1>
              <Formik
                initialValues={{
                  dni: "",
                  name: "",
                  lastname: "",
                  email: "",
                  pass: "",
                  province: "",
                  address: "",
                  area: "",
                  phone: "",
                }}
                validationSchema={createUserValidationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const response = await signupUser(values);
                    if (response && response.status === 400) {
                      console.error("Error al registrar el usuario:", response.data);
                    } else {
                      handleCreateNewUserConfirm();
                      closeCreateNewModalUser();
                    }
                  } catch (error) {
                    console.error("Error al registrar el usuario:", error);
                  } finally {
                    obtenerUsuariosDesdeBackend();
                    setSubmitting(false);
                  }
                }}>
                {({ handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <Field type="number" className="input-field bg-w text-c rounded w-56" name="dni" placeholder="DNI/LC/LE/PASSPORT" />
                      <ErrorMessage name="dni" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="text" className="input-field bg-w text-c rounded w-56" name="name" placeholder="Nombre" />
                      <ErrorMessage name="name" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="text" className="input-field bg-w text-c rounded w-56" name="lastname" placeholder="Apellido" />
                      <ErrorMessage name="lastname" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="email" className="input-field bg-w text-c rounded w-56" name="email" placeholder="Correo electrónico" />
                      <ErrorMessage name="email" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="password" className="input-field bg-w text-c rounded w-56" name="pass" placeholder="Contraseña" />
                      <ErrorMessage name="pass" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field as="select" className="input-field bg-w text-c rounded w-56" name="province">
                        <option value="">Selecciona una provincia</option>
                        <option value="Buenos Aires">Buenos Aires</option>
                        <option value="Catamarca">Catamarca</option>
                        <option value="Chaco">Chaco</option>
                        <option value="Chubut">Chubut</option>
                        <option value="Córdoba">Córdoba</option>
                        <option value="Corrientes">Corrientes</option>
                        <option value="Entre Ríos">Entre Ríos</option>
                        <option value="Formosa">Formosa</option>
                        <option value="Jujuy">Jujuy</option>
                        <option value="La Pampa">La Pampa</option>
                        <option value="La Rioja">La Rioja</option>
                        <option value="Mendoza">Mendoza</option>
                        <option value="Misiones">Misiones</option>
                        <option value="Neuquén">Neuquén</option>
                        <option value="Río Negro">Río Negro</option>
                        <option value="Salta">Salta</option>
                        <option value="San Juan">San Juan</option>
                        <option value="San Luis">San Luis</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="Santa Fe">Santa Fe</option>
                        <option value="Santiago del Estero">Santiago del Estero</option>
                        <option value="Tierra del Fuego">Tierra del Fuego</option>
                        <option value="Tucumán">Tucumán</option>
                      </Field>
                      <ErrorMessage name="province" component="div" className="text-red-300" />
                    </div>

                    <div className="mb-4">
                      <Field type="text" className="input-field bg-w text-c rounded w-56" name="address" placeholder="Dirección" />
                      <ErrorMessage name="address" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="number" className="input-field bg-w text-c rounded w-56" name="area" placeholder="Área" />
                      <ErrorMessage name="area" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="number" className="input-field bg-w text-c rounded w-56" name="phone" placeholder="Teléfono" />
                      <ErrorMessage name="phone" component="div" className="text-red-300" />
                    </div>
                    <div className="flex justify-between">
                      <button type="submit" className="btn text-black  bg-ts hover:bg-hb hover:text-w">
                        Crear usuario
                      </button>
                      <button onClick={closeCreateNewModalUser} className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        )}
        {/* Modal para Crear Nuevos Doctors */}
        {showCreateNewModalDoctor && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeCreateNewModalDoctor}>
            <div className="bg-c text-w rounded-lg p-8 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
              <h1 className="text-3xl font-bold mb-6">Crear Doctor</h1>
              <Formik
                initialValues={{
                  dni: "",
                  name: "",
                  lastname: "",
                  email: "",
                  pass: "",
                  specialty: "",
                  licenceNumber: "",
                  rol: "",
                }}
                validationSchema={createDoctorValidationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    let isDoctorValue = true;
                    let isAuditorValue = false;

                    // Verificar el valor del rol y actualizar isDoctor e isAuditor en consecuencia
                    if (values.rol === "User") {
                      isDoctorValue = false;
                      isAuditorValue = false;
                    } else if (values.rol === "Doctor") {
                      isDoctorValue = true;
                      isAuditorValue = false;
                    } else if (values.rol === "Auditor") {
                      isDoctorValue = true;
                      isAuditorValue = true;
                    }

                    // Crear un objeto con los valores del formulario incluyendo isDoctor e isAuditor
                    const formDataDoctor = {
                      dni: values.dni,
                      name: values.name,
                      lastname: values.lastname,
                      email: values.email,
                      pass: values.pass,
                      specialty: values.specialty,
                      licenceNumber: values.licenceNumber,
                      isDoctor: isDoctorValue,
                      isAuditor: isAuditorValue,
                    };

                    // Llamar a la función signupDoctor con formDataDoctor
                    const response = await signupDoctor(formDataDoctor);

                    if (response && response.status === 400) {
                      console.error("Error al registrar el usuario:", response.data);
                    } else {
                      handleCreateNewDoctorConfirm();
                      closeCreateNewModalDoctor();
                    }
                  } catch (error) {
                    console.error("Error al registrar el usuario:", error);
                  } finally {
                    // Realizar cualquier acción adicional necesaria después del envío del formulario
                    obtenerDoctoresDesdeBackend();
                    setSubmitting(false);
                  }
                }}>
                {({ handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <Field type="number" className="input-field bg-w text-c rounded w-56" name="dni" placeholder="DNI/LC/LE/PASSPORT" />
                      <ErrorMessage name="dni" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="text" className="input-field bg-w text-c rounded w-56" name="name" placeholder="Nombre" />
                      <ErrorMessage name="name" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="text" className="input-field bg-w text-c rounded w-56" name="lastname" placeholder="Apellido" />
                      <ErrorMessage name="lastname" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="email" className="input-field bg-w text-c rounded w-56" name="email" placeholder="Correo electrónico" />
                      <ErrorMessage name="email" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="password" className="input-field bg-w text-c rounded w-56" name="pass" placeholder="Contraseña" />
                      <ErrorMessage name="pass" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field as="select" className="input-field bg-w text-c rounded w-56" name="specialty">
                        <option value="">Selecciona una especialidad</option>
                        {especialidadesMedicas.map((especialidad, index) => (
                          <option key={index} value={especialidad}>
                            {especialidad}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="specialty" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field type="number" className="input-field bg-w text-c rounded w-56" name="licenceNumber" placeholder="Número de Licencia" />
                      <ErrorMessage name="licenceNumber" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field as="select" className="input-field bg-w text-c rounded w-56" name="rol">
                        <option value="Doctor">Selecciona un rol</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Auditor">Auditor</option>
                        {/* Agregar otras opciones si es necesario */}
                      </Field>
                      <ErrorMessage name="rol" component="div" className="text-red-300" />
                    </div>
                    <div className="flex justify-between">
                      <button type="submit" className="btn text-black  bg-ts hover:bg-hb hover:text-w">
                        Crear usuario
                      </button>
                      <button onClick={closeCreateNewModalDoctor} className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        )}
        {/* Modal para Crear Nuevos Appointments */}
        {showCreateNewModalAppoinment && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeCreateNewModalAppointment}>
            <div className="bg-c text-w rounded-lg p-8 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
              <h1 className="text-3xl font-bold mb-6">Crear Cita</h1>
              <Formik
                initialValues={{
                  user: "",
                  doctor: "",
                  appointmentDate: "",
                  appointmentTime: "",
                  state: true,
                  especialidad: "", // Agrega la especialidad al estado inicial
                }}
                validationSchema={appointmentCreateValidationSchema}
                onSubmit={async (values) => {
                  try {
                    const selectedDate = moment(values.appointmentDate); // Obtener la fecha seleccionada del formulario

                    // Obtener la fecha formateada para enviarla al backend
                    const formattedDate = selectedDate.format("YYYY-MM-DD");
                    // Actualizar el valor de 'doctor' en 'values' con el valor actual de 'doctorId'
                    values.doctor = doctorId;
                    values.appointmentDate = formattedDate;
                    values.user = userId;
                    const response = await postAppointment(values);
                    // Resto del código...
                    handleCreateNewAppoinmentConfirm();
                    closeCreateNewModalAppointment();
                    obtenerCitasDesdeBackend();
                  } catch (error) {
                    console.error("Error al crear la cita:", error);
                  }
                }}>
                {({ handleSubmit, values, setFieldValue }) => (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <input
                        type="text"
                        className="input-field bg-w text-c rounded w-56"
                        name="dni"
                        placeholder="DNI/LC/LE/PASSPORT"
                        value={dni}
                        onChange={(e) => handleDniChange(e)} // Manejar cambios en el DNI
                      />
                    </div>
                    <div className="mb-4">
                      <Field
                        as="select"
                        className="input-field bg-w text-c rounded w-56"
                        name="especialidad"
                        onChange={(e) => {
                          handleEspecialidadChange(e); // Llama a la función handleEspecialidadChange
                          setFieldValue("especialidad", e.target.value);
                          setDoctorId(""); // Resetear el doctor seleccionado cuando se cambia la especialidad
                        }}>
                        <option value="">Selecciona una especialidad</option>
                        {especialidadesMedicas.map((especialidad, index) => (
                          <option key={index} value={especialidad}>
                            {especialidad}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="especialidad" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <select className="input-field bg-w text-c rounded w-56" name="doctor" value={doctorId} onChange={handleDoctorChangeCreate}>
                        <option value="">Selecciona un doctor</option>
                        {doctoresCreate.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                      <ErrorMessage name="doctor" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <DatePicker
                        className="input-field bg-w text-c rounded w-56"
                        selected={values.appointmentDate}
                        onChange={(date) => {
                          setFieldValue("appointmentDate", date);
                          handleDateChangeCreate(date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Selecciona una fecha"
                        name="appointmentDate"
                        filterDate={(date) => {
                          const day = date.getDay();
                          const today = new Date();
                          return day !== 0 && day !== 6 && date >= today;
                        }}
                      />
                      <ErrorMessage name="appointmentDate" component="div" className="text-red-300" />
                    </div>
                    <div className="mb-4">
                      <Field as="select" className="input-field bg-w text-c rounded w-56" name="appointmentTime">
                        <option value="">Selecciona una hora</option>
                        {generateTimeOptionsCreate()}
                      </Field>
                      <ErrorMessage name="appointmentTime" component="div" className="text-red-300" />
                    </div>
                    <div className="flex justify-between">
                      <button type="submit" className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Crear cita
                      </button>
                      <button onClick={closeCreateNewModalAppointment} type="button" className="btn text-black bg-ts hover:bg-hb hover:text-w">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        )}

        {showCreateNewModalUserConfirm && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarCreateNewUserSuccess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Usuario creado correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    handleCerrarCreateNewUserSuccess();
                    closeCreateNewModalUser();
                  }}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {showCreateNewModalDoctorConfirm && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarCreateNewDoctorSuccess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Doctor creado correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    handleCerrarCreateNewDoctorSuccess();
                    closeCreateNewModalDoctor();
                  }}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de confirmación de guardar cambios de User */}
        {showCreateNewModalAppoinmentConfirm && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={handleCerrarCreateNewAppoinmentSuccess}>
            <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <p className="text-c font-medium">Cita creada correctamente.</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    handleCerrarCreateNewAppoinmentSuccess();
                    closeCreateNewModalAppointment();
                  }}
                  className="px-4 py-2 bg-ts text-c rounded hover:bg-hb hover:text-w"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de appoinments By Id User */}
        {showAppointmentbyIdUserModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeAppointmentByIdUserModal}>
            <div className="bg-c rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <div className="citas-contenedor max-h-80 overflow-y-auto bg-c">
                <h1 className="text-center mb-3 font-medium">Citas del Usuario</h1>
                {/* Verificar si el usuario tiene citas */}
                {userAppointments.length === 0 ? (
                  <p className="text-center text-w">El usuario no tiene citas registradas.</p>
                ) : (
                  // Ordenar las citas por fecha de forma descendente
                  userAppointments
                    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                    .map((appointment, index) => (
                      <div key={index} className="cita-contenedor bg-w rounded-lg m-1 p-1">
                        <div className="cita-tarjeta m-1 text-c">
                          <h2 className="font-medium">{`Cita el ${appointment.appointmentDate} a las ${appointment.appointmentTime}`}</h2>
                          <p>
                            <strong className="text-hb"> ID de usuario:</strong> {appointment.user}
                          </p>
                          <p>
                            <strong className="text-hb">Nombre de usuario:</strong> {nombresApellidosUsuarios[appointment.user]}
                          </p>
                          <p>
                            <strong className="text-hb">ID de médico:</strong> {appointment.doctor}
                          </p>
                          <p>
                            <strong className="text-hb">Nombre de médico:</strong> {nombresApellidosDoctores[appointment.doctor]}
                          </p>
                          {/* Mostrar más detalles de la cita según sea necesario */}
                        </div>
                      </div>
                    ))
                )}
              </div>
              <div className="flex justify-center mt-4 ">
                <button
                  onClick={() => {
                    closeAppointmentByIdUserModal();
                  }}
                  className="px-4 py-2 rounded hover:bg-hb hover:text-w text-c bg-ts"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de appoinments By Id Doctor */}
        {showAppointmentbyIdDoctorModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center" onClick={closeAppointmentByIdDoctorModal}>
            <div className="bg-c rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
              <div className="citas-contenedor max-h-80 overflow-y-auto bg-c">
                <h1 className="text-center mb-3 font-medium">Citas del Doctor</h1>
                {/* Verificar si el usuario tiene citas */}
                {doctorAppointments.length === 0 ? (
                  <p className="text-center text-w">El doctor no tiene citas registradas.</p>
                ) : (
                  // Ordenar las citas por fecha de forma descendente
                  doctorAppointments
                    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                    .map((appointment, index) => (
                      <div key={index} className="cita-contenedor bg-w rounded-lg m-1 p-1">
                        <div className="cita-tarjeta m-1 text-c">
                          <h2 className="font-medium">{`Cita el ${appointment.appointmentDate} a las ${appointment.appointmentTime}`}</h2>
                          <p>
                            <strong className="text-hb"> ID de usuario:</strong> {appointment.user}
                          </p>
                          <p>
                            <strong className="text-hb">Nombre de usuario:</strong> {nombresApellidosUsuarios[appointment.user]}
                          </p>
                          <p>
                            <strong className="text-hb">ID de médico:</strong> {appointment.doctor}
                          </p>
                          <p>
                            <strong className="text-hb">Nombre de médico:</strong> {nombresApellidosDoctores[appointment.doctor]}
                          </p>
                          {/* Mostrar más detalles de la cita según sea necesario */}
                        </div>
                      </div>
                    ))
                )}
              </div>
              <div className="flex justify-center mt-4 ">
                <button
                  onClick={() => {
                    closeAppointmentByIdDoctorModal();
                  }}
                  className="px-4 py-2 rounded hover:bg-hb hover:text-w text-c bg-ts"
                  // Llamar a la función para cerrar la modal de confirmación
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Table;
