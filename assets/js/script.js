//Guardamos el botón en una variable para agregarle el evento.
const btnCalcular = document.querySelector("#calcular");

//Obtenermos la info. del api y try y catch para detectar errores.
const obtenerInfo = async (selectValue) => {
  try {
    const data = await fetch(`https://mindicador.cl/api/${selectValue}`);
    const response = await data.json();
    return response;
  } catch (e) {
    const errorSpan = document.getElementById("errorSpan");
    errorSpan.innerHTML = `Algo salió mal! Error: ${e.message}`; //Mensaje de error en el span.
  }
};

//Definimos arreglo fecha para que se lea: día/mes/año.
const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

//Creamos el gráfico.
const crearGrafico = (series) => {
  const limitedSeries = series.slice(-10); //Limitamos los datos a 10.
  const data = limitedSeries.map((serie) => serie.valor);
  let fechas = limitedSeries
    .map((serie) => formatearFecha(serie.fecha)) //Arreglar fecha.
    .reverse(); //Dar vuelta la fecha.

  const ctx = document.getElementById("myChart").getContext("2d");

  new Chart(ctx, {
    type: "line", //Gráfico de línea.
    data: {
      labels: fechas, //Fechas.
      datasets: [
        {
          label: "Historial Últimos 10 días",
          data: data, //Valores Monedas.
          borderWidth: 2,
          borderColor: "#ff6384", //Color línea.
        },
      ],
    },
  });
};

//Agregamos el evento al btn.
btnCalcular.addEventListener("click", async () => {
  const errorSpan = document.getElementById("errorSpan"); //Por si detectamos otro error.
  errorSpan.innerHTML = ""; // Limpiamos el mensaje de error previo.
  let grafico = Chart.getChart("myChart");
  if (grafico !== undefined) {
    grafico.destroy(); //Destruir el gráfico para hacer otro nuevo.
  }
  const inputValue = document.querySelector("#monto").value; //Tomamos el Input.
  const selectValue = document.querySelector("#moneda").value; //Tomamos el select.

   // Validamos la selección de moneda
   if (selectValue === "moneda") {
    errorSpan.innerHTML = "Por favor, elige una moneda válida."; //Mensaje de error en el span.
    return;
  }

  const respuesta = await obtenerInfo(selectValue);
  if (respuesta && respuesta.serie){ //Si no hay error seguimos con el procedimiento normal.
    let cambio = inputValue / respuesta.serie[0].valor; //Cálculo para obtener el resultado de cambio de moneda.
    crearGrafico(respuesta.serie);
    document.querySelector("#resultado").innerHTML = `Resultado: $ ${cambio.toFixed(2)}`; //Agregar sólo hasta 2 decimales.
  }else { //Si hay error mostramos el mensaje.
    errorSpan.innerHTML = "No se pudo obtener la información. Intenta nuevamente."; //Mensaje de error en el span.
  }
});
