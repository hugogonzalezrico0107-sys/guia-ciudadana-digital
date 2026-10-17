
document.addEventListener("DOMContentLoaded", iniciarPortal);

async function iniciarPortal() {
  const contenedor = document.getElementById("lista-tramites");
  const buscador = document.getElementById("busqueda");
  const estado = document.getElementById("estado-busqueda");

  if (!contenedor || !buscador || !estado) {
    console.error("No se encontraron los elementos del portal.");
    return;
  }

  try {
    const respuesta = await fetch("tramites.xml");

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar tramites.xml");
    }

    const textoXML = await respuesta.text();
    const parser = new DOMParser();
    const documentoXML = parser.parseFromString(
      textoXML,
      "application/xml"
    );

    if (documentoXML.querySelector("parsererror")) {
      throw new Error("El archivo XML contiene un error de formato.");
    }

    const registros = Array.from(
      documentoXML.querySelectorAll("tramite")
    ).map((elemento) => ({
      id: elemento.getAttribute("id") || "",
      nombre: obtenerTexto(elemento, "nombre"),
      descripcion: obtenerTexto(elemento, "descripcion"),
      requisitos: obtenerTexto(elemento, "requisitos"),
      modalidad: obtenerTexto(elemento, "modalidad"),
      url: obtenerTexto(elemento, "url")
    }));

    if (registros.length === 0) {
      throw new Error("El XML no contiene trámites.");
    }

    function mostrarTramites(lista) {
      contenedor.replaceChildren();

      if (lista.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No se encontraron trámites.";
        contenedor.appendChild(mensaje);
        return;
      }

      lista.forEach((tramite) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        const titulo = document.createElement("h3");
        titulo.textContent = tramite.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = tramite.descripcion;

        const requisitos = document.createElement("p");
        requisitos.textContent = "Requisitos: " + tramite.requisitos;

        const modalidad = document.createElement("p");
        modalidad.textContent = "Modalidad: " + tramite.modalidad;

        const enlace = document.createElement("a");
        enlace.href = tramite.url;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.textContent = "Consultar fuente oficial";

        tarjeta.append(
          titulo,
          descripcion,
          requisitos,
          modalidad,
          enlace
        );

        contenedor.appendChild(tarjeta);
      });
    }


function filtrarTramites() {
  const consulta = buscador.value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const resultados = registros.filter((tramite) => {
    const contenido = [
      tramite.nombre,
      tramite.descripcion,
      tramite.requisitos,
      tramite.modalidad
    ]
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return contenido.includes(consulta);
  });

  mostrarTramites(resultados);

  estado.textContent = consulta
    ? "Resultados encontrados: " + resultados.length
    : "Trámites disponibles: " + registros.length;
}


    buscador.addEventListener("input", filtrarTramites);

    mostrarTramites(registros);
    estado.textContent = "Trámites disponibles: " + registros.length;

  } catch (error) {
    console.error("Error al cargar los trámites:", error);
    contenedor.replaceChildren();

    const mensaje = document.createElement("p");
    mensaje.textContent =
      "No se pudo cargar la información. Verifica tramites.xml y abre la página con Live Server.";

    contenedor.appendChild(mensaje);
    estado.textContent = "No fue posible cargar los trámites.";
  }
}

function obtenerTexto(elemento, etiqueta) {
  const campo = elemento.querySelector(etiqueta);
  return campo ? campo.textContent.trim() : "";
}
